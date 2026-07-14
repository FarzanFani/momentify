from datetime import datetime, timedelta

from apps.reviews.models import Review
from apps.reviews.serializers import PublicReviewSerializer
from django.forms import ValidationError
from django.utils import timezone
from rest_framework import serializers

from .models import Booking
from ..companies.models import Company
from ..services.models import Service


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
            "customer_name",
            "contact_detail_email",
            "guest_numbers",
            "contact_detail_full_name",
            "contact_detail_phone_number",
            "starts_at",
            "ends_at",
        ]

    def get_category_name(self, obj):
        if obj.service.category:
            return obj.service.category.name
        return None

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
            "company_name",
            "category_name",
            "service_name",
            "customer_name",
            "created_at",
            "updated_at",
            "payment_option",
            "event_type",
            "is_paid",
            "deposit_amount",
            "review",
            "starts_at",
            "ends_at",
        ]
        read_only_fields = [
            "id",
            "company",
            "customer",
            "updated_at",
            "status",
            "created_at",
            "cancelled_at",
            "refund_amount",
            "cancellation_reason",
            "total_price",
            "event_type",
            "is_paid",
            "deposit_amount",
            "ends_at",
        ]

    def validate(self, attrs):
        guest_numbers = attrs.get(
            "guest_numbers",
            getattr(self.instance, "guest_numbers", None),
        )
        service = attrs.get(
            "service",
            getattr(self.instance, "service", None),
        )
        starts_at = attrs.get(
            "starts_at",
            getattr(self.instance, "starts_at", None),
        )
        ends_at = attrs.get(
            "ends_at",
            getattr(self.instance, "ends_at", None),
        )

        errors = {}

        # Validate guest count.
        if guest_numbers is not None:
            if guest_numbers < 1:
                errors["guest_numbers"] = (
                    "Guest number must be greater than or equal to 1."
                )
            elif service and guest_numbers > service.max_capacity:
                errors["guest_numbers"] = (
                    f"Guest number must be between 1 and " f"{service.max_capacity}."
                )

        # Validate the booking start time.
        if starts_at is not None and starts_at < timezone.now():
            errors["starts_at"] = "Event date and time cannot be in the past."

        # Calculate the end time using the service duration.
        if starts_at is not None and service is not None:
            calculated_ends_at = starts_at + timedelta(minutes=service.duration_minutes)

            # The backend controls ends_at.
            ends_at = calculated_ends_at
            attrs["ends_at"] = calculated_ends_at

        # Validate the datetime order.
        if starts_at is not None and ends_at is not None and ends_at <= starts_at:
            errors["ends_at"] = "Event end time must be later than the start time."

        if errors:
            raise serializers.ValidationError(errors)

        # Check for overlapping bookings.
        if starts_at is not None and ends_at is not None and service is not None:
            request = self.context.get("request")

            if request and request.user and request.user.is_authenticated:
                overlapping_bookings = Booking.objects.filter(
                    customer=request.user,
                    service=service,
                    starts_at__lt=ends_at,
                    ends_at__gt=starts_at,
                ).exclude(
                    status__in=[
                        Booking.VerificationStatus.CANCELLED,
                        Booking.VerificationStatus.REJECTED,
                    ]
                )

                # Do not compare an updated booking with itself.
                if self.instance is not None:
                    overlapping_bookings = overlapping_bookings.exclude(
                        pk=self.instance.pk
                    )

                if overlapping_bookings.exists():
                    raise serializers.ValidationError(
                        {
                            "starts_at": (
                                "You already have a booking for this service "
                                "during this time."
                            )
                        }
                    )

        return attrs

    def get_category_name(self, obj):
        if obj.service.category:
            return obj.service.category.name
        return None

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
        validated_data["total_price"] = service.price
        validated_data["event_type"] = service.category.name if service.category else ""
        auto_approve_booking = service.company.auto_approve_booking
        if auto_approve_booking:
            validated_data["status"] = Booking.VerificationStatus.CONFIRMED

        return super().create(validated_data)


class BookingCancelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["cancellation_reason"]

    def update(self, instance, validated_data):
        instance.status = Booking.VerificationStatus.CANCELLED
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
