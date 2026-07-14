import uuid
from datetime import timedelta
from decimal import Decimal

from django.core.validators import MinValueValidator

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
    buffer_before_minutes = models.PositiveIntegerField(
        default=0, validators=[MinValueValidator(0)]
    )
    buffer_after_minutes = models.PositiveIntegerField(
        default=0, validators=[MinValueValidator(0)]
    )
    price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0"))]
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

    def __str__(self):
        return f"{self.name} - {self.company}"
