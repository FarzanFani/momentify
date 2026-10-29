import uuid
from datetime import timedelta
from decimal import Decimal
from django.db.models import Q

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
                condition=models.Q(price__gte=0),
                name="service_price_gte_0",
            ),
            models.CheckConstraint(
                condition=models.Q(duration_minutes__gte=1),
                name="service_duration_gte_1",
            ),
            models.CheckConstraint(
                condition=models.Q(buffer_before_minutes__gte=0),
                name="service_buffer_before_gte_0",
            ),
            models.CheckConstraint(
                condition=models.Q(buffer_after_minutes__gte=0),
                name="service_buffer_after_gte_0",
            ),
            models.CheckConstraint(
                condition=models.Q(max_capacity__gte=1),
                name="service_max_capacity_gte_1",
            ),
            models.CheckConstraint(
                condition=models.Q(minimum_billable_guest__gte=1)
                & models.Q(minimum_billable_guest__lte=models.F("max_capacity")),
                name="svc_min_billable_valid",
            ),
            models.CheckConstraint(
                condition=(
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
    cover_image = models.ImageField(
        upload_to="packages/covers/",
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Inactive packages are hidden from customers.",
    )
    services = models.ManyToManyField(
        Service, through="ServicePackageItem", related_name="package"
    )
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.PROTECT,
        related_name="package",
        help_text="Category the package is listed under. "
        "Included services may belong to any category.",
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

    included_guests = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Number of guests covered by the package price.",
    )
    price_per_extra_guest = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Price charged for each guest above the included guests.",
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
    installment_count = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(2), MaxValueValidator(52)],
        help_text=(
            "Number of installments the total is split into. Leave empty if "
            "installments are not available."
        ),
    )
    installment_interval = models.CharField(
        max_length=20,
        choices=InstallmentInterval.choices,
        null=True,
        blank=True,
        help_text=(
            "Frequency of installment payments. Required when an "
            "installment count is configured."
        ),
    )

    allow_scheduling_late = models.BooleanField(
        default=False,
        help_text="Customers may buy the package and schedule its services later.",
    )
    scheduling_deadline_days = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(365)],
        help_text=(
            "Days after booking within which every service must be scheduled. "
            "Required when late scheduling is allowed."
        ),
    )

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Service package"
        verbose_name_plural = "Service packages"

        constraints = [
            # At least one payment plan must be available.
            models.CheckConstraint(
                condition=(
                    Q(allow_full_payment=True)
                    | Q(deposit_percentage__isnull=False)
                    | Q(installment_count__isnull=False)
                ),
                name="service_package_has_payment_plan",
            ),
            # Deposit must be NULL or between 0 and 100.
            models.CheckConstraint(
                condition=(
                    Q(deposit_percentage__isnull=True)
                    | (
                        Q(deposit_percentage__gt=Decimal("0.00"))
                        & Q(deposit_percentage__lt=Decimal("100.00"))
                    )
                ),
                name="service_package_valid_deposit_percentage",
            ),
            # Installment count and interval must be set together.
            models.CheckConstraint(
                condition=(
                    Q(
                        installment_count__isnull=True,
                        installment_interval__isnull=True,
                    )
                    | Q(
                        installment_count__gte=2,
                        installment_interval__isnull=False,
                    )
                ),
                name="service_package_valid_installment_configuration",
            ),
            models.CheckConstraint(
                condition=Q(included_guests__gte=1),
                name="service_package_included_guests_gte_1",
            ),
        ]

    def __str__(self):
        return self.name

    @classmethod
    def calculate_breakdown(
        cls,
        *,
        pricing_method,
        lines,
        fixed_price=None,
        fixed_discount=None,
        percentage_discount=None,
    ):
        """
        Price a package from its item lines.

        `lines` is an iterable of (price, quantity, required) tuples. Required
        items form the base subtotal the pricing method applies to; optional
        items are add-ons priced on top and are not discounted.
        """
        subtotal = Decimal("0.00")
        addons_subtotal = Decimal("0.00")
        for price, quantity, required in lines:
            line_total = Decimal(price) * quantity
            if required:
                subtotal += line_total
            else:
                addons_subtotal += line_total

        if pricing_method == cls.PricingMethod.FIXED_PRICE:
            total = fixed_price or Decimal("0.00")
        elif pricing_method == cls.PricingMethod.PERCENTAGE_DISCOUNT:
            discount = (
                subtotal * (percentage_discount or Decimal("0.00")) / Decimal("100")
            )
            total = subtotal - discount
        elif pricing_method == cls.PricingMethod.FIXED_DISCOUNT:
            total = subtotal - (fixed_discount or Decimal("0.00"))
        else:
            total = subtotal

        total = max(Decimal("0.00"), total).quantize(Decimal("0.01"))

        return {
            "services_subtotal": subtotal.quantize(Decimal("0.01")),
            "addons_subtotal": addons_subtotal.quantize(Decimal("0.01")),
            "total_price": total,
            "savings": max(Decimal("0.00"), subtotal - total).quantize(
                Decimal("0.01")
            ),
        }

    def _item_lines(self):
        return [(item.price, item.quantity, item.required) for item in self.items.all()]

    @property
    def price_breakdown(self):
        return self.calculate_breakdown(
            pricing_method=self.pricing_method,
            lines=self._item_lines(),
            fixed_price=self.fixed_price,
            fixed_discount=self.fixed_discount,
            percentage_discount=self.percentage_discount,
        )

    @property
    def services_subtotal(self):
        return self.price_breakdown["services_subtotal"]

    @property
    def total_price(self):
        return self.price_breakdown["total_price"]

    @property
    def max_guests(self):
        capacities = [item.service.max_capacity for item in self.items.all()]
        return min(capacities) if capacities else None

    @property
    def installment_amount(self):
        if not self.installment_count:
            return None
        return (self.total_price / self.installment_count).quantize(Decimal("0.01"))

    def calculate_price(self, guest_count, addon_item_ids=()):
        """Final price for a guest count and a selection of optional items."""
        breakdown = self.price_breakdown
        extra_guests = max(0, guest_count - self.included_guests)
        extra_guests_price = (extra_guests * self.price_per_extra_guest).quantize(
            Decimal("0.01")
        )

        addon_item_ids = {str(item_id) for item_id in addon_item_ids}
        addons_price = sum(
            (
                item.price * item.quantity
                for item in self.items.all()
                if not item.required and str(item.id) in addon_item_ids
            ),
            Decimal("0.00"),
        )

        return {
            "package_price": breakdown["total_price"],
            "extra_guests": extra_guests,
            "extra_guests_price": extra_guests_price,
            "addons_price": addons_price.quantize(Decimal("0.01")),
            "total_price": (
                breakdown["total_price"] + extra_guests_price + addons_price
            ).quantize(Decimal("0.01")),
        }

    def clean(self):
        super().clean()

        errors = {}

        required_value_field = {
            self.PricingMethod.FIXED_PRICE: "fixed_price",
            self.PricingMethod.PERCENTAGE_DISCOUNT: "percentage_discount",
            self.PricingMethod.FIXED_DISCOUNT: "fixed_discount",
        }.get(self.pricing_method)

        for field in ("fixed_price", "percentage_discount", "fixed_discount"):
            value = getattr(self, field)
            if field == required_value_field:
                if value is None or value <= Decimal("0.00"):
                    errors[field] = (
                        f"{field.replace('_', ' ').capitalize()} must be greater "
                        "than zero for this pricing method."
                    )
            elif value is not None:
                errors[field] = (
                    f"{field.replace('_', ' ').capitalize()} must be empty for "
                    "this pricing method."
                )

        if (self.installment_count is None) != (self.installment_interval is None):
            errors["installment_count"] = (
                "Installment count and interval must be set together."
            )

        if (
            not self.allow_full_payment
            and self.deposit_percentage is None
            and self.installment_count is None
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
        help_text="Price of one unit of the service inside this package.",
    )
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    required = models.BooleanField(
        default=True,
        help_text="Required items are always included. Optional items are "
        "add-ons the customer may choose.",
    )
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["package", "service"],
                name="unique_service_per_package",
            ),
        ]

    @property
    def line_total(self):
        return self.price * self.quantity

    def __str__(self):
        return f"{self.package.name} - {self.service.name}"
