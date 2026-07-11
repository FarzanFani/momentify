from datetime import datetime, timedelta

from apps.reviews.models import Review
from apps.reviews.serializers import PublicReviewSerializer
from django.forms import ValidationError
from django.utils import timezone
from rest_framework import serializers

from .models import Booking


class BookingsListSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    service_name = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "service_name",
            "category_name",
            "status",
            "location",
            "total_price",
            "event_date",
            "event_time",
            "event_end_time",
            "customer_name",
            "contact_detail_email",
            "guest_numbers",
            "contact_detail_full_name",
            "contact_detail_phone_number",
        ]

    def get_category_name(self, obj):
        return obj.category.name

    def get_service_name(self, obj):
        return obj.service.name

    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}"


class BookingSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    service_name = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    review = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "company",
            "customer",
            "service",
            "location",
            "status",
            "total_price",
            "special_request",
            "cancelled_at",
            "refund_amount",
            "cancellation_reason",
            "contact_detail_full_name",
            "contact_detail_email",
            "contact_detail_phone_number",
            "guest_numbers",
            "category",
            "company_name",
            "category_name",
            "service_name",
            "customer_name",
            "created_at",
            "updated_at",
            "event_date",
            "event_time",
            "payment_option",
            "event_type",
            "event_end_time",
            "is_paid",
            "deposit_amount",
            "review",
        ]
        read_only_fields = [
            "id",
            "company",
            "customer",
            "category",
            "updated_at",
            "status",
            "created_at",
            "cancelled_at",
            "refund_amount",
            "cancellation_reason",
            "total_price",
            "event_type",
            "event_end_time",
            "is_paid",
            "deposit_amount",
        ]

    def validate(self, attrs):
        guest_numbers = attrs.get("guest_numbers")
        service = attrs.get("service")
        event_time = attrs.get("event_time")
        event_date = attrs.get("event_date")

        if self.instance:
            guest_numbers = (
                guest_numbers
                if guest_numbers is not None
                else self.instance.guest_numbers
            )
            service = service if service is not None else self.instance.service
            event_time = (
                event_time if event_time is not None else self.instance.event_time
            )
            event_date = (
                event_date if event_date is not None else self.instance.event_date
            )

        if guest_numbers is not None:
            if guest_numbers < 0:
                raise serializers.ValidationError(
                    {
                        "guest_numbers": "Guest number must be greater than or equal to 0."
                    }
                )

            if service and guest_numbers > service.max_capacity:
                raise serializers.ValidationError(
                    {
                        "guest_numbers": f"Guest number must be between 0 and {service.max_capacity}."
                    }
                )

        if event_time and event_date:
            event_datetime = datetime.combine(event_date, event_time)

            if event_datetime < datetime.now():
                raise serializers.ValidationError(
                    {"event_time": "Event date and time cannot be in the past"}
                )

        if event_time and event_date:
            event_datetime = datetime.combine(event_date, event_time)

            if event_datetime < datetime.now():
                raise serializers.ValidationError(
                    {"event_time": "Event date and time cannot be in the past"}
                )

            duration = getattr(service, "duration_minutes", None)

            if duration is not None:
                event_end_datetime = event_datetime + timedelta(minutes=duration)
                attrs["event_end_time"] = event_end_datetime.time()

                request = self.context.get("request")
                if request and request.user and request.user.is_authenticated:
                    overlapping_bookings = Booking.objects.filter(
                        customer=request.user, service=service, event_date=event_date
                    ).exclude(
                        status__in=[
                            Booking.VerificationStatus.CANCELLED,
                            Booking.VerificationStatus.REJECTED,
                        ]
                    )

                    if self.instance:
                        overlapping_bookings = overlapping_bookings.exclude(
                            id=self.instance.id
                        )

                    for booking in overlapping_bookings:
                        existing_start = datetime.combine(
                            booking.event_date, booking.event_time
                        )
                        existing_end = datetime.combine(
                            booking.event_date, booking.event_end_time
                        )

                        if (
                            event_datetime < existing_end
                            and event_end_datetime > existing_start
                        ):
                            raise ValidationError(
                                {
                                    "event_time": "You already have booking for this sevice during this time duration."
                                }
                            )

        return attrs

    def get_category_name(self, obj):
        return obj.category.name

    def get_company_name(self, obj):
        return obj.company.name

    def get_customer_name(self, obj):
        return obj.customer.first_name + " " + obj.customer.last_name

    def get_service_name(self, obj):
        return obj.service.name

    def get_review(self, obj):
        if obj.status != Booking.VerificationStatus.COMPLETED:
            return None
        try:
            return PublicReviewSerializer(obj.review).data
        except Review.DoesNotExist:
            return None

    def create(self, validated_data):
        request = self.context["request"]
        service = validated_data["service"]

        validated_data["customer"] = request.user
        validated_data["company"] = service.company
        validated_data["category"] = service.category
        validated_data["total_price"] = service.price
        validated_data["event_type"] = service.category.name

        return super().create(validated_data)


class BookingCancelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["cancellation_reason"]

    def update(self, instance, validated_data):
        instance.status = Booking.VerificationStatus.CANCELED
        instance.cancelled_at = timezone.now()
        instance.cancellation_reason = validated_data.get("cancellation_reason")
        instance.save(
            update_fields=[
                "status",
                "cancelled_at",
                "cancellation_reason",
                "updated_at",
            ]
        )
        return instance

    def validate_cancellation_reason(self, value):
        if not value:
            raise serializers.ValidationError("Cancellation reason is required")
        return value


class BookingApprovedDeclinedProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["status"]

    def update(self, instance, validated_data):
        current_status = instance.status
        if current_status != Booking.VerificationStatus.PENDING:
            raise serializers.ValidationError(
                "Only pending bookings can be confirmed or rejected."
            )
        instance.status = validated_data.get("status")
        instance.save(update_fields=["status", "updated_at"])
        return instance

    def validate_status(self, value):
        if value not in [
            Booking.VerificationStatus.REJECTED,
            Booking.VerificationStatus.CONFIRMED,
        ]:
            raise serializers.ValidationError(
                "Status can only be changed to confirmed or rejected."
            )
        return value
