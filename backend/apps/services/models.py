import uuid
from datetime import timedelta
from decimal import Decimal

from django.core.validators import MinValueValidator
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
                check=models.Q(minimum_billable_guests__gte=1)
                & models.Q(minimum_billable_guests__lte=models.F("max_capacity")),
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
        return self.price + (additional_guest * self.fixed_guest_count)

    def __str__(self):
        return f"{self.name} - {self.company}"
