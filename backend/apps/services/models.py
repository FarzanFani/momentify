import uuid
from datetime import timedelta
from decimal import Decimal
from django.db.models import Sum, Q

from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

from apps.companies.models import Company
from django.db import models
from django.utils.text import slugify


class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Service categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Service(models.Model):

    class GuestCountPolicy(models.TextChoices):
        VARIABLE = "variable", "Customer select guest count"
        FIXED = "fixed", "Fixed guest count"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company, on_delete=models.PROTECT, related_name="services"
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="services",
    )
    duration_minutes = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    max_capacity = models.IntegerField(validators=[MinValueValidator(1)])
    guest_count_policy = models.CharField(
        max_length=10,
        choices=GuestCountPolicy.choices,
        default=GuestCountPolicy.VARIABLE,
        help_text="Determines whether the customer can select guest count",
    )
    fixed_guest_count = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
        help_text="Required guest count when the service has a fixed guest count",
    )
    minimum_billable_guest = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Number of guest that include in the best price",
    )
    buffer_before_minutes = models.PositiveIntegerField(
        default=0, validators=[MinValueValidator(0)]
    )
    buffer_after_minutes = models.PositiveIntegerField(
        default=0, validators=[MinValueValidator(0)]
    )
    price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0"))]
    )
    price_per_guest = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Price charged for each guest above the minimum billable guest count",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Service"
        verbose_name_plural = "Services"

        indexes = [
            models.Index(
                fields=["company", "is_active"],
                name="service_company_active_idx",
            ),
        ]

        constraints = [
            models.CheckConstraint(
                check=models.Q(price__gte=0),
                name="service_price_gte_0",
            ),
            models.CheckConstraint(
                check=models.Q(duration_minutes__gte=1),
                name="service_duration_gte_1",
            ),
            models.CheckConstraint(
                check=models.Q(buffer_before_minutes__gte=0),
                name="service_buffer_before_gte_0",
            ),
            models.CheckConstraint(
                check=models.Q(buffer_after_minutes__gte=0),
                name="service_buffer_after_gte_0",
            ),
            models.CheckConstraint(
                check=models.Q(max_capacity__gte=1),
                name="service_max_capacity_gte_1",
            ),
            models.CheckConstraint(
                check=models.Q(minimum_billable_guest__gte=1)
                & models.Q(minimum_billable_guest__lte=models.F("max_capacity")),
                name="svc_min_billable_valid",
            ),
            models.CheckConstraint(
                check=(
                    models.Q(
                        guest_count_policy="variable",
                        fixed_guest_count__isnull=True,
                    )
                    | (
                        models.Q(guest_count_policy="fixed")
                        & models.Q(fixed_guest_count__isnull=False)
                        & models.Q(fixed_guest_count__gte=1)
                        & models.Q(fixed_guest_count__lte=models.F("max_capacity"))
                    )
                ),
                name="svc_fixed_guest_valid",
            ),
        ]

    @property
    def total_reserved_minutes(self) -> int:
        return (
            self.buffer_before_minutes
            + self.duration_minutes
            + self.buffer_after_minutes
        )

    @property
    def total_reserved_duration(self) -> timedelta:
        return timedelta(minutes=self.total_reserved_minutes)

    def clean(self):
        super().clean()

        errors = {}
        if self.minimum_billable_guest > self.max_capacity:
            errors["maximum_billable_guest"] = (
                "Minimum billable guest count is greater than maximum capacity"
            )

        if self.guest_count_policy == self.GuestCountPolicy.FIXED:
            if self.fixed_guest_count is None:
                errors["fixed_guest_count"] = (
                    "Fixed guest count is required for this service"
                )
            elif self.fixed_guest_count > self.max_capacity:
                errors["fixed_guest_count"] = (
                    "Fixed guest count is greater than maximum capacity"
                )
        elif self.fixed_guest_count is not None:
            errors["fixed_guest_count"] = "Fixed guest must be empty for this service"

        if errors:
            raise ValidationError(errors)

    def calculate_price(self, guest_count) -> Decimal:
        additional_guest = max(0, guest_count - self.minimum_billable_guest)
        return self.price + (additional_guest * self.price_per_guest)

    def __str__(self):
        return f"{self.name} - {self.company}"


class ServicePackages(models.Model):
    class PricingMethod(models.TextChoices):
        SERVICE_TOTAL = (
            "service_total",
            "Sum of service prices",
        )
        FIXED_PRICE = (
            "fixed_price",
            "Fixed package price",
        )
        PERCENTAGE_DISCOUNT = (
            "percentage_discount",
            "percentage discount",
        )
        FIXED_DISCOUNT = (
            "fixed_discount",
            "fixed discount",
        )

    class InstallmentInterval(models.TextChoices):
        WEEKLY = "weekly", "Weekly"
        BIWEEKLY = "biweekly", "Every two weeks"
        MONTHLY = "monthly", "Monthly"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    services = models.ManyToManyField(
        Service, through="ServicePackageItem", related_name="package"
    )
    category = models.ForeignKey(
        ServiceCategory, on_delete=models.PROTECT, related_name="package"
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name="service_packages",
    )
    pricing_method = models.CharField(
        max_length=20,
        choices=PricingMethod.choices,
        default=PricingMethod.SERVICE_TOTAL,
    )
    fixed_discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    percentage_discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal("0.00")),
            MaxValueValidator(Decimal("100")),
        ],
    )
    fixed_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        help_text="Final package price, regardless of included service prices.",
    )

    allow_full_payment = models.BooleanField(default=True)
    deposit_percentage = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal("0.00")),
            MaxValueValidator(Decimal("99.99")),
        ],
        help_text=(
            "Leave empty if deposit payments are not available. "
            "Example: enter 20 for a 20% deposit."
        ),
    )
    installment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
        help_text=(
            "Amount of each installment. Leave empty if installments "
            "are not available."
        ),
    )
    installment_interval = models.CharField(
        max_length=20,
        choices=InstallmentInterval.choices,
        null=True,
        blank=True,
        help_text=(
            "Frequency of installment payments. Required when an "
            "installment amount is configured."
        ),
    )

    allow_scheduling_late = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Service package"
        verbose_name_plural = "Service packages"

        constraints = [
            # At least one payment plan must be available.
            models.CheckConstraint(
                check=(
                    Q(allow_full_payment=True)
                    | Q(deposit_percentage__isnull=False)
                    | Q(installment_amount__isnull=False)
                ),
                name="service_package_has_payment_plan",
            ),
            # Deposit must be NULL or between 0 and 100.
            models.CheckConstraint(
                check=(
                    Q(deposit_percentage__isnull=True)
                    | (
                        Q(deposit_percentage__gt=Decimal("0.00"))
                        & Q(deposit_percentage__lt=Decimal("100.00"))
                    )
                ),
                name="service_package_valid_deposit_percentage",
            ),
            # Installment amount and interval must be set together.
            models.CheckConstraint(
                check=(
                    Q(
                        installment_amount__isnull=True,
                        installment_interval__isnull=True,
                    )
                    | Q(
                        installment_amount__gt=Decimal("0.00"),
                        installment_interval__isnull=False,
                    )
                ),
                name="service_package_valid_installment_configuration",
            ),
        ]

    def __str__(self):
        return self.name

    @property
    def services_subtotal(self):
        return self.services.aggregate(total=Sum("price"))["total"]

    @property
    def total_price(self):
        subtotal = self.services_subtotal

        if self.pricing_method == self.PricingMethod.SERVICE_TOTAL:
            return subtotal

        if self.pricing_method == self.PricingMethod.FIXED_PRICE:
            return self.fixed_price or 0

        if self.pricing_method == self.PricingMethod.PERCENTAGE_DISCOUNT:
            discount = (
                subtotal
                * (self.percentage_discount or Decimal("0.00"))
                / Decimal("100")
            )
            return max(0, subtotal - discount).quantize(Decimal("0.01"))

        if self.pricing_method == self.PricingMethod.FIXED_DISCOUNT:
            return max(
                subtotal, (self.fixed_discount or Decimal("0.00")), Decimal("0.00")
            )

        return subtotal

    def clean(self):
        super().clean()

        errors = {}

        # Pricing method validation
        if self.pricing_method == self.PricingMethod.SERVICE_TOTAL:
            if self.fixed_price is not None:
                errors["fixed_price"] = (
                    "Fixed price must be empty when pricing method is service total."
                )

            if self.fixed_discount is not None:
                errors["fixed_discount"] = (
                    "Fixed discount must be empty when pricing method is service total."
                )

            if self.percentage_discount is not None:
                errors["percentage_discount"] = (
                    "Percentage discount must be empty when pricing method is service total."
                )

        elif self.pricing_method == self.PricingMethod.FIXED_PRICE:
            if self.fixed_price is None:
                errors["fixed_price"] = (
                    "Fixed price is required when pricing method is fixed price."
                )

            if self.fixed_discount is not None:
                errors["fixed_discount"] = (
                    "Fixed discount must be empty when pricing method is fixed price."
                )

            if self.percentage_discount is not None:
                errors["percentage_discount"] = (
                    "Percentage discount must be empty when pricing method is fixed price."
                )

        elif self.pricing_method == self.PricingMethod.PERCENTAGE_DISCOUNT:
            if self.percentage_discount is None:
                errors["percentage_discount"] = (
                    "Percentage discount is required for this pricing method."
                )
            elif self.percentage_discount <= Decimal("0.00"):
                errors["percentage_discount"] = (
                    "Percentage discount must be greater than zero."
                )

            if self.fixed_price is not None:
                errors["fixed_price"] = (
                    "Fixed price must be empty when using percentage discount."
                )

            if self.fixed_discount is not None:
                errors["fixed_discount"] = (
                    "Fixed discount must be empty when using percentage discount."
                )

        elif self.pricing_method == self.PricingMethod.FIXED_DISCOUNT:
            if self.fixed_discount is None:
                errors["fixed_discount"] = (
                    "Fixed discount is required for this pricing method."
                )
            elif self.fixed_discount <= Decimal("0.00"):
                errors["fixed_discount"] = "Fixed discount must be greater than zero."

            if self.fixed_price is not None:
                errors["fixed_price"] = (
                    "Fixed price must be empty when using fixed discount."
                )

            if self.percentage_discount is not None:
                errors["percentage_discount"] = (
                    "Percentage discount must be empty when using fixed discount."
                )

        # Payment plan validation
        installment_amount_is_set = self.installment_amount is not None
        installment_interval_is_set = self.installment_interval is not None

        if installment_amount_is_set and not installment_interval_is_set:
            errors["installment_interval"] = (
                "Installment interval is required when an installment "
                "amount is provided."
            )

        if installment_interval_is_set and not installment_amount_is_set:
            errors["installment_amount"] = (
                "Installment amount is required when an installment "
                "interval is selected."
            )

        if (
            not self.allow_full_payment
            and self.deposit_percentage is None
            and self.installment_amount is None
        ):
            errors["allow_full_payment"] = (
                "At least one payment plan must be available."
            )
        if errors:
            raise ValidationError(errors)


class ServicePackageItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    package = models.ForeignKey(
        ServicePackages, on_delete=models.CASCADE, related_name="items"
    )
    service = models.ForeignKey(
        Service, on_delete=models.PROTECT, related_name="package_items"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="service-specific price. Empty means use the service's normal price.",
    )
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    required = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["package", "service"],
                name="unique_service_per_package",
            ),
        ]

    def __str__(self):
        return f"{self.package.name} - {self.service.name}"
