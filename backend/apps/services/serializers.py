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
    category_name = serializers.CharField(
        source="category.name", read_only=True, default=None
    )

    class Meta:
        model = Service
        fields = ["id", "name", "price", "max_capacity", "category_name"]
        read_only_fields = fields


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
            attrs["fixed_guest_count"] = None
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
        return obj.category.name if obj.category else None

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
    service_price = serializers.DecimalField(
        source="service.price", max_digits=10, decimal_places=2, read_only=True
    )
    service_category_name = serializers.CharField(
        source="service.category.name", read_only=True, default=None
    )

    price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, min_value=Decimal("0.00")
    )
    line_total = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = ServicePackageItem
        fields = [
            "id",
            "package",
            "service",
            "service_name",
            "service_price",
            "service_category_name",
            "price",
            "quantity",
            "required",
            "line_total",
            "updated_at",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "package"]

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
            "cover_image",
            "is_active",
            "pricing_method",
            "fixed_price",
            "fixed_discount",
            "percentage_discount",
            "included_guests",
            "price_per_extra_guest",
            "allow_full_payment",
            "deposit_percentage",
            "installment_interval",
            "installment_count",
            "allow_scheduling_late",
            "scheduling_deadline_days",
            "created_at",
            "updated_at",
            "services",
            "category",
            "category_name",
            "company",
            "company_name",
        ]
        read_only_fields = ["id", "cover_image", "created_at", "updated_at"]

    def get_company_name(self, obj):
        return obj.company.name

    def get_category_name(self, obj):
        return obj.category.name

    def to_representation(self, instance):
        data = super().to_representation(instance)
        breakdown = instance.price_breakdown
        data.update({key: str(value) for key, value in breakdown.items()})
        installment_amount = instance.installment_amount
        data["installment_amount"] = (
            str(installment_amount) if installment_amount is not None else None
        )
        data["max_guests"] = instance.max_guests
        return data

    def validate_services(self, services):
        company = self.context.get("company")

        if not services:
            raise serializers.ValidationError(
                "A package must contain at least one service."
            )

        service_ids = set()

        for item in services:
            service = item["service"]

            if service.company_id != company.id:
                raise serializers.ValidationError(
                    "All services must belong to the selected company."
                )

            if service.id in service_ids:
                raise serializers.ValidationError(
                    "The same service cannot be added more than once."
                )
            service_ids.add(service.id)

        if not any(item.get("required", True) for item in services):
            raise serializers.ValidationError(
                "At least one service must be required. Optional services are "
                "add-ons on top of the package."
            )

        return services

    def _current(self, attrs, field, default=None):
        return attrs.get(field, getattr(self.instance, field, default))

    def _item_lines_and_capacities(self, attrs):
        items = attrs.get("items")
        if items is not None:
            lines = [
                (
                    item.get("price", item["service"].price),
                    item.get("quantity", 1),
                    item.get("required", True),
                )
                for item in items
            ]
            capacities = [item["service"].max_capacity for item in items]
        elif self.instance is not None:
            lines = self.instance._item_lines()
            capacities = [
                item.service.max_capacity for item in self.instance.items.all()
            ]
        else:
            lines, capacities = [], []
        return lines, capacities

    def validate(self, attrs):
        if self._current(attrs, "category") is None:
            raise serializers.ValidationError(
                {"category": "A category must be selected."}
            )

        pricing_method = self._current(attrs, "pricing_method")
        fixed_price = self._current(attrs, "fixed_price")
        fixed_discount = self._current(attrs, "fixed_discount")
        percentage_discount = self._current(attrs, "percentage_discount")

        lines, capacities = self._item_lines_and_capacities(attrs)
        subtotal = ServicePackages.calculate_breakdown(
            pricing_method=ServicePackages.PricingMethod.SERVICE_TOTAL, lines=lines
        )["services_subtotal"]

        # Pricing method: validate the value it needs and clear the others.
        if pricing_method == ServicePackages.PricingMethod.FIXED_PRICE:
            if fixed_price is None or fixed_price <= Decimal("0"):
                raise serializers.ValidationError(
                    {"fixed_price": "Fixed price must be greater than 0."}
                )
            if fixed_price > subtotal:
                raise serializers.ValidationError(
                    {
                        "fixed_price": (
                            "Fixed price cannot be higher than the total of "
                            f"the required services ({subtotal})."
                        )
                    }
                )
            attrs["percentage_discount"] = None
            attrs["fixed_discount"] = None

        elif pricing_method == ServicePackages.PricingMethod.PERCENTAGE_DISCOUNT:
            if (
                percentage_discount is None
                or percentage_discount <= Decimal("0")
                or percentage_discount >= Decimal("100")
            ):
                raise serializers.ValidationError(
                    {
                        "percentage_discount": (
                            "Percentage discount must be between 0 and 100."
                        )
                    }
                )
            attrs["fixed_discount"] = None
            attrs["fixed_price"] = None

        elif pricing_method == ServicePackages.PricingMethod.FIXED_DISCOUNT:
            if fixed_discount is None or fixed_discount <= Decimal("0"):
                raise serializers.ValidationError(
                    {"fixed_discount": "Fixed discount must be greater than 0."}
                )
            if fixed_discount >= subtotal:
                raise serializers.ValidationError(
                    {
                        "fixed_discount": (
                            "Fixed discount must be lower than the total of "
                            f"the required services ({subtotal})."
                        )
                    }
                )
            attrs["percentage_discount"] = None
            attrs["fixed_price"] = None

        else:
            attrs["percentage_discount"] = None
            attrs["fixed_discount"] = None
            attrs["fixed_price"] = None

        # Guests
        included_guests = self._current(attrs, "included_guests", 1)
        max_guests = min(capacities) if capacities else None
        if max_guests is not None and included_guests > max_guests:
            raise serializers.ValidationError(
                {
                    "included_guests": (
                        "Included guests cannot exceed the smallest service "
                        f"capacity in the package ({max_guests})."
                    )
                }
            )

        # Late scheduling needs a deadline; without it the deadline is unused.
        if self._current(attrs, "allow_scheduling_late", False):
            deadline_days = self._current(attrs, "scheduling_deadline_days")
            if deadline_days is None or not 1 <= deadline_days <= 365:
                raise serializers.ValidationError(
                    {
                        "scheduling_deadline_days": (
                            "Set how many days customers have to schedule "
                            "(1 to 365)."
                        )
                    }
                )
        else:
            attrs["scheduling_deadline_days"] = None

        # Payment plans
        allow_full_payment = self._current(attrs, "allow_full_payment", False)
        deposit_percentage = self._current(attrs, "deposit_percentage")
        installment_count = self._current(attrs, "installment_count")
        installment_interval = self._current(attrs, "installment_interval")

        if (
            allow_full_payment is False
            and installment_count is None
            and deposit_percentage is None
        ):
            raise serializers.ValidationError(
                {"allow_full_payment": "At least one payment plan must be selected."}
            )

        if installment_count is not None and installment_interval is None:
            raise serializers.ValidationError(
                {
                    "installment_interval": (
                        "Installment interval must be selected for the "
                        "installment plan."
                    )
                }
            )

        if installment_count is None and installment_interval is not None:
            raise serializers.ValidationError(
                {
                    "installment_count": (
                        "Number of installments must be set for the "
                        "installment plan."
                    )
                }
            )

        if installment_count is not None and not 2 <= installment_count <= 52:
            raise serializers.ValidationError(
                {"installment_count": "Number of installments must be between 2 and 52."}
            )

        if deposit_percentage is not None and not (
            Decimal("0.00") < deposit_percentage <= Decimal("99.99")
        ):
            raise serializers.ValidationError(
                {"deposit_percentage": "Deposit percentage must be between 0 and 99.99."}
            )

        return attrs

    def _create_items(self, package, items):
        for item in items:
            item.setdefault("price", item["service"].price)
            ServicePackageItem.objects.create(package=package, **item)

    @transaction.atomic
    def create(self, validated_data):
        items = validated_data.pop("items")
        package = ServicePackages.objects.create(**validated_data)
        self._create_items(package, items)
        return package

    @transaction.atomic
    def update(self, instance, validated_data):
        items = validated_data.pop("items", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        if items is not None:
            instance.items.all().delete()
            self._create_items(instance, items)
            # Drop the prefetched items so the response reflects the new ones.
            getattr(instance, "_prefetched_objects_cache", {}).pop("items", None)

        return instance


class PackageCoverImageSerializer(serializers.ModelSerializer):
    cover_image = serializers.ImageField(required=True)

    class Meta:
        model = ServicePackages
        fields = ["cover_image"]


class PackagePriceCalculationSerializer(serializers.Serializer):
    guest_count = serializers.IntegerField(min_value=1)
    addons = serializers.ListField(
        child=serializers.UUIDField(), required=False, default=list
    )

    def validate(self, attrs):
        package = self.context["package"]

        max_guests = package.max_guests
        if max_guests is not None and attrs["guest_count"] > max_guests:
            raise serializers.ValidationError(
                {"guest_count": f"This package supports up to {max_guests} guests."}
            )

        optional_item_ids = {
            item.id for item in package.items.all() if not item.required
        }
        invalid_addons = [
            str(addon) for addon in attrs["addons"] if addon not in optional_item_ids
        ]
        if invalid_addons:
            raise serializers.ValidationError(
                {"addons": "Add-ons must be optional services of this package."}
            )

        return attrs
