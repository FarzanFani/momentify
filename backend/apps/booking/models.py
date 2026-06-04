import uuid

from apps.accounts.models import User
from apps.companies.models import Company
from apps.services.models import Service, ServiceCategory
from django.core.validators import MinValueValidator
from django.db import models


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
        Service, on_delete=models.CASCADE, related_name="bookings"
    )
    customer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="bookings"
    )
    category = models.ForeignKey(
        ServiceCategory, on_delete=models.CASCADE, related_name="bookings"
    )
    guest_numbers = models.IntegerField(
        validators=[
            MinValueValidator(limit_value=0, message="Guest number minimum value is 0")
        ],
    )
    location = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[
            MinValueValidator(limit_value=0, message="Total price minimum value is 0")
        ],
    )
    contact_detail_full_name = models.CharField(max_length=255)
    contact_detail_email = models.EmailField(max_length=255)
    contact_detail_phone_number = models.CharField(max_length=255)
    special_request = models.TextField(blank=True, null=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    refund_amount = models.DecimalField(
        blank=True,
        null=True,
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0, message="Refund amount minimum value is 0")],
    )
    cancellation_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    payment_option = models.CharField(
        max_length=40,
        choices=PaymentOptions.choices,
        default=PaymentOptions.REQUEST_BOOKING_FIRST,
    )
    event_date = models.DateField()
    event_time = models.TimeField()
    event_type = models.CharField(max_length=255)
    event_end_time = models.TimeField()
    is_paid = models.BooleanField(default=True)
    deposit_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(0, message="Deposit amount minimum value is 0")],
    )

    class Meta:
        ordering = ["-updated_at"]
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"

    def __str__(self):
        return f"{self.customer} - {self.service} - {self.status}"
