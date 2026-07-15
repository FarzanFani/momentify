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
            "company_name",
            "category_name",
            "review",
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

    def get_review(self, obj):
        try:
            queryset = Review.objects.filter(service=obj)
            return ReviewSerializer(queryset, many=True).data
        except Review.DoesNotExist:
            return None
