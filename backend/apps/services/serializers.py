import logging
from decimal import Decimal

from rest_framework import serializers

from .models import Service, ServiceCategory
from ..reviews.models import Review
from ..reviews.serializers import ReviewSerializer

logger = logging.getLogger(__name__)


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = [
            "id",
            "name",
            "slug",
        ]
        read_only_fields = ["id", "slug"]


class ServiceSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    review = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            "id",
            "company",
            "name",
            "description",
            "category",
            "duration_minutes",
            "max_capacity",
            "buffer_before_minutes",
            "buffer_after_minutes",
            "price",
            "is_active",
            "minimum_billable_guest",
            "fixed_guest_count",
            "price_per_guest",
            "guest_count_policy",
            "company_name",
            "category_name",
            "review",
        ]

        read_only_fields = ["id", "company"]

        extra_kwargs = {
            "category": {"required": True, "allow_null": False},
            "max_capacity": {"required": False},
        }

    def validate_price(self, value):
        if value <= Decimal("0"):
            raise serializers.ValidationError("Price must be positive")
        return value

    # def validate_max_capacity(self, value):
    #     if value < 0:
    #         raise serializers.ValidationError("Max capacity must be positive")
    #     return value

    def validate_price_per_guest(self, value):
        if value <= Decimal("0"):
            raise serializers.ValidationError("Price must be positive")
        return value

    def validate(self, attrs):
        instance = self.instance

        guest_count_policy = attrs.get(
            "guest_count_policy",
            getattr(instance, "guest_count_policy", None),
        )
        max_capacity = attrs.get(
            "max_capacity",
            getattr(instance, "max_capacity", None),
        )
        fixed_guest_count = attrs.get(
            "fixed_guest_count",
            getattr(instance, "fixed_guest_count", None),
        )
        minimum_billable_guest = attrs.get(
            "minimum_billable_guest",
            getattr(instance, "minimum_billable_guest", None),
        )

        if guest_count_policy == Service.GuestCountPolicy.FIXED:
            if fixed_guest_count is None or fixed_guest_count < 1:
                raise serializers.ValidationError(
                    {"fixed_guest_count": "Fixed guest count must be greater than 0."}
                )

            attrs["max_capacity"] = fixed_guest_count
            attrs["minimum_billable_guest"] = fixed_guest_count

        elif guest_count_policy == Service.GuestCountPolicy.VARIABLE:
            errors = {}

            if max_capacity is None or max_capacity < 1:
                errors["max_capacity"] = "Max capacity must be greater than 0."

            if minimum_billable_guest is None or minimum_billable_guest < 1:
                errors["minimum_billable_guest"] = (
                    "Minimum billable guest count must be greater than 0."
                )

            if (
                max_capacity is not None
                and minimum_billable_guest is not None
                and minimum_billable_guest > max_capacity
            ):
                errors["minimum_billable_guest"] = (
                    "Minimum billable guest count cannot exceed max capacity."
                )

            if errors:
                raise serializers.ValidationError(errors)

        return attrs

    def get_company_name(self, obj):
        return obj.company.name

    def get_category_name(self, obj):
        return obj.category.name

    def get_review(self, obj):
        queryset = Review.objects.filter(service=obj)
        return ReviewSerializer(queryset, many=True).data
