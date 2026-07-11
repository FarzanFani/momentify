import logging
from decimal import Decimal

from rest_framework import serializers

from .models import Service, ServiceCategory

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
            "company_name",
            "category_name",
        ]

        read_only_fields = ["id", "company"]

        extra_kwargs = {"category": {"required": True, "allow_null": False}}

    def validate_price(self, value):
        if value <= Decimal("0"):
            raise serializers.ValidationError("Price must be posotive")
        return value

    def validate_max_capacity(self, value):
        if value < 0:
            raise serializers.ValidationError("Max capacity must be posotive")
        return value

    def get_company_name(self, obj):
        return obj.company.name

    def get_category_name(self, obj):
        return obj.category.name
