import uuid

from django.conf import settings
from apps.companies.models import Company
from apps.services.models import Service
from django.core.validators import MinValueValidator
from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal
from datetime import timedelta


class Booking(models.Model):

    class VerificationStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"
        REJECTED = "REJECTED", "Rejected"

    class PaymentOptions(models.TextChoices):
        REQUEST_BOOKING_FIRST = "REQUEST_BOOKING_FIRST", "Request booking first"
        PAY_DEPOSIT_LATER = "PAY_DEPOSIT_LATER", "Pay deposit later"
        PAY_FULL_AMOUNT_LATER = "PAY_FULL_AMOUNT_LATER", "Pay full amount later"
        PAY_FULL_AMOUNT_NOW = "PAY_FULL_AMOUNT_NOW", "Pay full amount now"
        PAY_DEPOSIT_NOW = "PAY_DEPOSIT_NOW", "Pay deposit now"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="bookings"
    )
    service = models.ForeignKey(
        Service, on_delete=models.PROTECT, related_name="bookings"
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="bookings",
    )
    guest_numbers = models.PositiveIntegerField(
        validators=[MinValueValidator(1, message="Guest number minimum value is 1")],
    )
    location = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.00"), message="Total price cannot be negetive")
        ],
    )
    contact_detail_full_name = models.CharField(max_length=255)
    contact_detail_email = models.EmailField()
    contact_detail_phone_number = models.CharField(max_length=32)
    special_request = models.TextField(blank=True)
    cancelled_at = models.DateTimeField(null=True)
    refund_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(
                Decimal("0.00"), message="Refund amount cannot be negetive"
            )
        ],
    )
    cancellation_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    payment_option = models.CharField(
        max_length=40,
        choices=PaymentOptions.choices,
        default=PaymentOptions.REQUEST_BOOKING_FIRST,
    )
    event_type = models.CharField(max_length=255)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    is_paid = models.BooleanField(default=False)
    deposit_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[
            MinValueValidator(
                Decimal("0.00"), message="Deposit amount minimum value is 0"
            )
        ],
    )

    class Meta:
        ordering = ["-updated_at"]
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"

        constraints = [
            models.CheckConstraint(
                check=models.Q(guest_numbers__gte=1),
                name="booking_guest_numbers_gte_1",
            ),
            models.CheckConstraint(
                check=models.Q(ends_at__gt=models.F("starts_at")),
                name="booking_ends_at_after_starts_at",
            ),
            models.CheckConstraint(
                check=models.Q(total_price__gte=0),
                name="booking_total_price_gte_0",
            ),
            models.CheckConstraint(
                check=(
                    models.Q(deposit_amount__isnull=True)
                    | models.Q(deposit_amount__gte=0)
                ),
                name="booking_deposit_null_or_gte_0",
            ),
            models.CheckConstraint(
                check=models.Q(refund_amount__gte=0),
                name="booking_refund_amount_gte_0",
            ),
            models.CheckConstraint(
                check=(
                    models.Q(deposit_amount__isnull=True)
                    | models.Q(deposit_amount__lte=models.F("total_price"))
                ),
                name="booking_deposit_lte_total_price",
            ),
            models.CheckConstraint(
                check=models.Q(refund_amount__lte=models.F("total_price")),
                name="booking_refund_lte_total_price",
            ),
        ]

    def clean(self):
        errors = {}

        if (
            self.service_id
            and self.company_id
            and self.company_id != self.service.company_id
        ):
            errors["company"] = (
                "Booking company must match the selected service company."
            )

        if self.status == self.VerificationStatus.CANCELLED:
            if self.cancelled_at is None:
                errors["cancelled_at"] = (
                    "Cancelled bookings must have a cancellation time."
                )
        elif self.cancelled_at is not None:
            errors["cancelled_at"] = (
                "Only cancelled bookings may have a cancellation time."
            )

        if (
            self.service_id
            and self.guest_numbers is not None
            and self.guest_numbers > self.service.max_capacity
        ):
            errors["guest_numbers"] = "Guest number exceeds the service capacity."

        if errors:
            raise ValidationError(errors)

    @property
    def reserved_from(self):
        return self.starts_at - timedelta(minutes=self.service.buffer_before_minutes)

    @property
    def reserved_until(self):
        return self.ends_at + timedelta(minutes=self.service.buffer_after_minutes)

    def __str__(self):
        return (
            f"{self.customer} - {self.service} - "
            f"{self.starts_at:%Y-%m-%d %H:%M} - {self.status}"
        )
