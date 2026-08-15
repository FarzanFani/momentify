import logging
from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from .models import Service, ServiceCategory, ServicePackageItem, ServicePackages
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


class ServiceTinySerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "price"]
        read_only_fields = ["id", "price", "name"]


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


class PriceCalculationSerializer(serializers.Serializer):
    service = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all())
    guest_count = serializers.IntegerField(min_value=1)
    calculated_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    def validate(self, attrs):
        service = attrs["service"]
        guest_count = attrs["guest_count"]

        if service is None:
            raise serializers.ValidationError("Service must be provided.")

        if service.guest_count_policy != Service.GuestCountPolicy.VARIABLE:
            raise serializers.ValidationError(
                "Service Must be Variable to have Dynamic Price."
            )

        attrs["calculated_price"] = service.calculate_price(guest_count=guest_count)

        return attrs


class ServicePackageItemSerializer(serializers.ModelSerializer):
    service = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.filter(is_active=True)
    )
    service_name = serializers.CharField(source="service.name", read_only=True)

    price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, min_value=Decimal("0.00")
    )

    class Meta:
        model = ServicePackageItem
        fields = [
            "id",
            "package",
            "service",
            "service_name",
            "price",
            "quantity",
            "required",
            "updated_at",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "package"]

    def validate_price(self, value):
        if value <= Decimal("0"):
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value


class ServicePackageSerializer(serializers.ModelSerializer):
    services = ServicePackageItemSerializer(source="items", many=True, required=True)
    company = serializers.PrimaryKeyRelatedField(read_only=True)
    company_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = ServicePackages
        fields = [
            "id",
            "name",
            "description",
            "pricing_method",
            "fixed_price",
            "fixed_discount",
            "percentage_discount",
            "allow_full_payment",
            "deposit_percentage",
            "installment_interval",
            "installment_amount",
            "allow_scheduling_late",
            "created_at",
            "updated_at",
            "services",
            "category",
            "category_name",
            "company",
            "company_name",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_company_name(self, obj):
        return obj.company.name

    def get_category_name(self, obj):
        return obj.category.name

    def validate_services(self, services):
        company = self.context.get("company")

        if not services:
            raise serializers.ValidationError(
                {"Services": "A package must contain at least one service"}
            )

        service_ids = set()

        for item in services:
            service = item["service"]

            if service.company_id != company.id:
                raise serializers.ValidationError(
                    {"services": "All Services must belong to selected company"}
                )

            if service.id in service_ids:
                raise serializers.ValidationError(
                    {"services": "The same service cannot be added more than once"}
                )
            service_ids.add(service.id)

        return services

    def validate(self, attrs):
        category = attrs.get(
            "category",
            getattr(self.instance, "category", None),
        )

        services = attrs.get("items")

        if category is None:
            raise serializers.ValidationError(
                {"category": "A category must be selected."}
            )

        if services is not None:
            invalid_services = [
                str(item["service"].id)
                for item in services
                if item["service"].category_id != category.id
            ]

            if invalid_services:
                raise serializers.ValidationError(
                    {
                        "services": (
                            "All services must belong to the selected category. "
                            f"Invalid service IDs: {', '.join(invalid_services)}"
                        )
                    }
                )

        pricing_method = attrs.get(
            "pricing_method",
            getattr(self.instance, "pricing_method", None),
        )
        percentage_discount = attrs.get(
            "percentage_discount",
            getattr(self.instance, "percentage_discount", None),
        )
        fixed_price = attrs.get(
            "fixed_price",
            getattr(self.instance, "fixed_price", None),
        )
        fixed_discount = attrs.get(
            "fixed_discount",
            getattr(self.instance, "fixed_discount", None),
        )

        allow_full_payment = attrs.get(
            "allow_full_payment", getattr(self.instance, "allow_full_payment", False)
        )
        installment_amount = attrs.get(
            "installment_amount", getattr(self.instance, "installment_amount", None)
        )
        deposit_percentage = attrs.get(
            "deposit_percentage", getattr(self.instance, "deposit_percentage", None)
        )
        installment_interval = attrs.get(
            "installment_interval", getattr(self.instance, "installment_interval", None)
        )

        # Validate pricing method
        if pricing_method == ServicePackages.PricingMethod.FIXED_PRICE:
            if fixed_price is None:
                raise serializers.ValidationError(
                    {"fixed_price": "Fixed price must be provided."}
                )
            if fixed_price <= Decimal("0"):
                raise serializers.ValidationError(
                    {"fixed_price": "Fixed price must be greater than 0."}
                )
            attrs["percentage_discount"] = None
            attrs["fixed_discount"] = None

        elif pricing_method == ServicePackages.PricingMethod.SERVICE_TOTAL:
            attrs["percentage_discount"] = None
            attrs["fixed_discount"] = None
            attrs["fixed_price"] = None

        elif pricing_method == ServicePackages.PricingMethod.PERCENTAGE_DISCOUNT:
            if percentage_discount is None:
                raise serializers.ValidationError(
                    {"percentage_discount": "Percentage discount must be provided."}
                )
            if percentage_discount <= Decimal("0") or percentage_discount > Decimal(
                "100"
            ):
                raise serializers.ValidationError(
                    {
                        "percentage_discount": "Percentage discount must be between 0 and 100."
                    }
                )
            attrs["fixed_discount"] = None
            attrs["fixed_price"] = None

        elif pricing_method == ServicePackages.PricingMethod.FIXED_DISCOUNT:
            if fixed_discount is None:
                raise serializers.ValidationError(
                    {"percentage_discount": "Percentage discount must be provided."}
                )
            if percentage_discount <= Decimal("0"):
                raise serializers.ValidationError(
                    {
                        "percentage_discount": "Percentage discount must be greater than 0."
                    }
                )
            attrs["percentage_discount"] = None
            attrs["fixed_price"] = None

        # Validate Payment plan
        if (
            allow_full_payment is False
            and installment_amount is None
            and deposit_percentage is None
        ):
            raise serializers.ValidationError(
                {"allow_full_payment": "At least one plan must be selected"}
            )

        if installment_amount is not None and installment_interval is None:
            raise serializers.ValidationError(
                {
                    "installment_interval": "Installment interval must selected for installment plan"
                }
            )

        if installment_amount is None and installment_interval is not None:
            raise serializers.ValidationError(
                {
                    "installment_amount": "Installment amount must selected for installment plan"
                }
            )

        if installment_amount is not None and installment_interval is not None:
            if installment_amount <= Decimal("0.00"):
                raise serializers.ValidationError(
                    {"installment_amount": "Installment amount must be greater then 0."}
                )

        if deposit_percentage is not None:
            if deposit_percentage <= Decimal("0.00") or deposit_percentage > Decimal(
                "99.99"
            ):
                raise serializers.ValidationError(
                    {
                        "deposit_percentage": "Deposit percentage must be between 0 and 99.99"
                    }
                )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        services = validated_data.pop("items")
        package = ServicePackages.objects.create(**validated_data)

        for item in services:
            ServicePackageItem.objects.create(
                package=package,
                service=item["service"],
                price=item.get("price", item["service"].price),
                **{
                    key: value
                    for key, value in item.items()
                    if key not in ["service", "price"]
                },
            )

        return package

    @transaction.atomic
    def update(self, instance, validated_data):
        services = validated_data.pop("items", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        if services is not None:
            instance.items.all().delete()
            for item in services:
                item.setdefault("price", item["service"].price)

                ServicePackageItem.objects.create(
                    package=instance,
                    **item,
                )

        return instance
