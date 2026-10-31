from datetime import timedelta
from decimal import Decimal

from apps.services.models import ServicePackages
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import Booking, PackageBooking, PackageBookingItem

INACTIVE_BOOKING_STATUSES = [
    Booking.VerificationStatus.CANCELLED,
    Booking.VerificationStatus.REJECTED,
]


def validate_service_slot(*, service, starts_at, customer):
    """
    Check one service can be booked at `starts_at` and return its end time.

    Mirrors the single-booking rules: no past dates, no overlapping booking
    of the same service by this customer, and no overlap with anyone when the
    company auto-approves bookings. Working hours and time off are not checked.
    """
    if starts_at < timezone.now():
        raise serializers.ValidationError(
            f"{service.name}: date and time cannot be in the past."
        )

    ends_at = starts_at + timedelta(minutes=service.duration_minutes)
    overlapping = Booking.objects.filter(
        service=service, starts_at__lt=ends_at, ends_at__gt=starts_at
    ).exclude(status__in=INACTIVE_BOOKING_STATUSES)

    if overlapping.filter(customer=customer).exists():
        raise serializers.ValidationError(
            f"{service.name}: you already have a booking for this service "
            "during this time."
        )

    if service.company.auto_approve_booking and overlapping.exists():
        raise serializers.ValidationError(
            f"{service.name}: the selected time is full. Choose another time."
        )

    return ends_at


def create_service_booking(package_booking, item, starts_at, ends_at):
    """Create the `Booking` row for one scheduled service of a package."""
    booking = Booking.objects.create(
        company=package_booking.company,
        service=item.service,
        package_booking=package_booking,
        customer=package_booking.customer,
        guest_numbers=package_booking.guest_numbers,
        location=package_booking.location,
        status=package_booking.booking_status,
        # The package price is stored once on the package booking.
        total_price=Decimal("0.00"),
        contact_detail_full_name=package_booking.contact_detail_full_name,
        contact_detail_email=package_booking.contact_detail_email,
        contact_detail_phone_number=package_booking.contact_detail_phone_number,
        special_request=package_booking.special_request,
        event_type=package_booking.package.name,
        starts_at=starts_at,
        ends_at=ends_at,
    )
    item.booking = booking
    item.save(update_fields=["booking"])
    return booking


class ScheduleEntrySerializer(serializers.Serializer):
    item = serializers.UUIDField()
    starts_at = serializers.DateTimeField()


def validate_schedule_entries(entries, items_by_id, customer):
    """
    Validate (item id, start time) entries against the items they refer to.
    Returns a list of (item, starts_at, ends_at).
    """
    seen = set()
    slots = []
    errors = []

    for entry in entries:
        item = items_by_id.get(entry["item"])
        if item is None:
            raise serializers.ValidationError(
                {"schedule": "A scheduled service is not part of this booking."}
            )
        if entry["item"] in seen:
            raise serializers.ValidationError(
                {"schedule": "Each service can only be scheduled once."}
            )
        seen.add(entry["item"])

        try:
            ends_at = validate_service_slot(
                service=item.service, starts_at=entry["starts_at"], customer=customer
            )
        except serializers.ValidationError as error:
            errors.extend(error.detail)
            continue
        slots.append((item, entry["starts_at"], ends_at))

    if errors:
        raise serializers.ValidationError({"schedule": errors})

    return slots


class PackageBookingItemSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name", read_only=True)
    service_category_name = serializers.CharField(
        source="service.category.name", read_only=True, default=None
    )
    duration_minutes = serializers.IntegerField(
        source="service.duration_minutes", read_only=True
    )
    line_total = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    starts_at = serializers.DateTimeField(
        source="booking.starts_at", read_only=True, default=None
    )
    ends_at = serializers.DateTimeField(
        source="booking.ends_at", read_only=True, default=None
    )
    booking_status = serializers.CharField(
        source="booking.status", read_only=True, default=None
    )

    class Meta:
        model = PackageBookingItem
        fields = [
            "id",
            "service",
            "service_name",
            "service_category_name",
            "duration_minutes",
            "price",
            "quantity",
            "line_total",
            "is_addon",
            "booking",
            "starts_at",
            "ends_at",
            "booking_status",
        ]
        read_only_fields = fields


class PackageBookingSerializer(serializers.ModelSerializer):
    package_name = serializers.CharField(source="package.name", read_only=True)
    package_cover_image = serializers.ImageField(
        source="package.cover_image", read_only=True
    )
    company_name = serializers.CharField(source="company.name", read_only=True)
    customer_name = serializers.SerializerMethodField()
    items = PackageBookingItemSerializer(many=True, read_only=True)
    unscheduled_count = serializers.SerializerMethodField()
    is_schedule_overdue = serializers.SerializerMethodField()

    class Meta:
        model = PackageBooking
        fields = [
            "id",
            "package",
            "package_name",
            "package_cover_image",
            "company",
            "company_name",
            "customer",
            "customer_name",
            "status",
            "guest_numbers",
            "package_price",
            "extra_guests_price",
            "addons_price",
            "total_price",
            "payment_option",
            "deposit_amount",
            "installment_count",
            "installment_interval",
            "installment_amount",
            "is_paid",
            "schedule_deadline",
            "unscheduled_count",
            "is_schedule_overdue",
            "location",
            "contact_detail_full_name",
            "contact_detail_email",
            "contact_detail_phone_number",
            "special_request",
            "cancelled_at",
            "cancellation_reason",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}".strip()

    def get_unscheduled_count(self, obj):
        return sum(1 for item in obj.items.all() if item.booking_id is None)

    def get_is_schedule_overdue(self, obj):
        return (
            obj.schedule_deadline is not None
            and obj.schedule_deadline < timezone.now()
            and self.get_unscheduled_count(obj) > 0
        )


class PackageBookingCreateSerializer(serializers.Serializer):
    package = serializers.PrimaryKeyRelatedField(
        queryset=ServicePackages.objects.filter(is_active=True)
    )
    guest_numbers = serializers.IntegerField(min_value=1)
    addons = serializers.ListField(
        child=serializers.UUIDField(), required=False, default=list
    )
    payment_option = serializers.ChoiceField(
        choices=PackageBooking.PaymentOption.choices
    )
    schedule = ScheduleEntrySerializer(many=True, required=False, default=list)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    contact_detail_full_name = serializers.CharField(max_length=255)
    contact_detail_email = serializers.EmailField()
    contact_detail_phone_number = serializers.CharField(max_length=32)
    special_request = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        package = attrs["package"]
        package_items = list(
            package.items.select_related("service", "service__company")
        )

        if any(not item.service.is_active for item in package_items):
            raise serializers.ValidationError(
                {"package": "This package is currently unavailable."}
            )

        max_guests = package.max_guests
        if max_guests is not None and attrs["guest_numbers"] > max_guests:
            raise serializers.ValidationError(
                {"guest_numbers": f"This package supports up to {max_guests} guests."}
            )

        optional_ids = {item.id for item in package_items if not item.required}
        addons = set(attrs["addons"])
        if not addons <= optional_ids:
            raise serializers.ValidationError(
                {"addons": "Add-ons must be optional services of this package."}
            )

        option = attrs["payment_option"]
        allowed = {
            PackageBooking.PaymentOption.FULL: package.allow_full_payment,
            PackageBooking.PaymentOption.DEPOSIT: package.deposit_percentage
            is not None,
            PackageBooking.PaymentOption.INSTALLMENTS: package.installment_count
            is not None,
        }
        if not allowed[option]:
            raise serializers.ValidationError(
                {"payment_option": "This payment option is not offered for this package."}
            )

        # Items the customer is buying: every required item plus chosen add-ons.
        selected = {
            item.id: item
            for item in package_items
            if item.required or item.id in addons
        }
        slots = validate_schedule_entries(
            attrs["schedule"], selected, self.context["request"].user
        )

        if not package.allow_scheduling_late and len(slots) < len(selected):
            raise serializers.ValidationError(
                {"schedule": "Pick a date and time for every service in this package."}
            )

        attrs["selected_items"] = list(selected.values())
        attrs["slots"] = slots
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        package = validated_data["package"]
        customer = self.context["request"].user

        price = package.calculate_price(
            guest_count=validated_data["guest_numbers"],
            addon_item_ids=validated_data["addons"],
        )
        total = price["total_price"]

        payment_fields = {}
        option = validated_data["payment_option"]
        if option == PackageBooking.PaymentOption.DEPOSIT:
            payment_fields["deposit_amount"] = (
                total * package.deposit_percentage / Decimal("100")
            ).quantize(Decimal("0.01"))
        elif option == PackageBooking.PaymentOption.INSTALLMENTS:
            payment_fields.update(
                installment_count=package.installment_count,
                installment_interval=package.installment_interval,
                installment_amount=(total / package.installment_count).quantize(
                    Decimal("0.01")
                ),
            )

        package_booking = PackageBooking.objects.create(
            package=package,
            company=package.company,
            customer=customer,
            status=(
                PackageBooking.Status.CONFIRMED
                if package.company.auto_approve_booking
                else PackageBooking.Status.PENDING
            ),
            guest_numbers=validated_data["guest_numbers"],
            package_price=price["package_price"],
            extra_guests_price=price["extra_guests_price"],
            addons_price=price["addons_price"],
            total_price=total,
            payment_option=option,
            schedule_deadline=(
                timezone.now() + timedelta(days=package.scheduling_deadline_days)
                if package.allow_scheduling_late and package.scheduling_deadline_days
                else None
            ),
            location=validated_data.get("location", ""),
            contact_detail_full_name=validated_data["contact_detail_full_name"],
            contact_detail_email=validated_data["contact_detail_email"],
            contact_detail_phone_number=validated_data["contact_detail_phone_number"],
            special_request=validated_data.get("special_request", ""),
            **payment_fields,
        )

        booking_items = {}
        for package_item in validated_data["selected_items"]:
            booking_items[package_item.id] = PackageBookingItem.objects.create(
                package_booking=package_booking,
                service=package_item.service,
                price=package_item.price,
                quantity=package_item.quantity,
                is_addon=not package_item.required,
            )

        for package_item, starts_at, ends_at in validated_data["slots"]:
            create_service_booking(
                package_booking, booking_items[package_item.id], starts_at, ends_at
            )

        return package_booking


class PackageBookingScheduleSerializer(serializers.Serializer):
    schedule = ScheduleEntrySerializer(many=True, allow_empty=False)

    def validate(self, attrs):
        package_booking = self.context["package_booking"]

        if package_booking.status in (
            PackageBooking.Status.REJECTED,
            PackageBooking.Status.CANCELLED,
            PackageBooking.Status.COMPLETED,
        ):
            raise serializers.ValidationError(
                {"schedule": "This package booking can no longer be scheduled."}
            )

        deadline = package_booking.schedule_deadline
        if deadline is not None and deadline < timezone.now():
            raise serializers.ValidationError(
                {
                    "schedule": (
                        "The scheduling deadline has passed. Contact the "
                        "provider to arrange the remaining services."
                    )
                }
            )

        unscheduled = {
            item.id: item
            for item in package_booking.items.select_related("service__company")
            if item.booking_id is None
        }
        attrs["slots"] = validate_schedule_entries(
            attrs["schedule"], unscheduled, package_booking.customer
        )
        return attrs

    @transaction.atomic
    def save(self, **kwargs):
        package_booking = self.context["package_booking"]
        for item, starts_at, ends_at in self.validated_data["slots"]:
            create_service_booking(package_booking, item, starts_at, ends_at)
        return package_booking


class PackageBookingStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            PackageBooking.Status.CONFIRMED,
            PackageBooking.Status.REJECTED,
        ]
    )

    def validate(self, attrs):
        if self.instance.status != PackageBooking.Status.PENDING:
            raise serializers.ValidationError(
                {"status": "Only pending package bookings can be confirmed or rejected."}
            )
        return attrs

    @transaction.atomic
    def update(self, instance, validated_data):
        instance.status = validated_data["status"]
        instance.save(update_fields=["status", "updated_at"])
        instance.bookings.update(
            status=instance.booking_status, updated_at=timezone.now()
        )
        return instance


class PackageBookingCancelSerializer(serializers.Serializer):
    """Cancelling is the only change a customer can make to a package booking."""

    cancellation_reason = serializers.CharField(
        error_messages={
            "required": "Cancellation reason is required",
            "blank": "Cancellation reason is required",
        }
    )

    def validate(self, attrs):
        if self.instance.status not in (
            PackageBooking.Status.PENDING,
            PackageBooking.Status.CONFIRMED,
        ):
            raise serializers.ValidationError(
                {
                    "status": "Only pending or confirmed package bookings can be cancelled."
                }
            )
        return attrs

    @transaction.atomic
    def update(self, instance, validated_data):
        now = timezone.now()
        instance.status = PackageBooking.Status.CANCELLED
        instance.cancelled_at = now
        instance.cancellation_reason = validated_data["cancellation_reason"]
        instance.save(
            update_fields=[
                "status",
                "cancelled_at",
                "cancellation_reason",
                "updated_at",
            ]
        )
        instance.bookings.update(
            status=Booking.VerificationStatus.CANCELLED,
            cancelled_at=now,
            cancellation_reason=instance.cancellation_reason,
            updated_at=now,
        )
        return instance
