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
    package_booking = models.ForeignKey(
        "PackageBooking",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="bookings",
        help_text="Set when this booking is one scheduled service of a package.",
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


class PackageBooking(models.Model):
    """
    A customer's purchase of a service package.

    The provider approves or rejects the package as a whole. Each included
    service is scheduled separately; once it has a date it gets its own
    `Booking` row (linked through `PackageBookingItem.booking`) so calendars
    and overlap checks keep working. The package price lives here only, so
    those service bookings carry a total price of 0.
    """

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        REJECTED = "REJECTED", "Rejected"
        COMPLETED = "COMPLETED", "Completed"

    class PaymentOption(models.TextChoices):
        FULL = "FULL", "Full payment"
        DEPOSIT = "DEPOSIT", "Deposit"
        INSTALLMENTS = "INSTALLMENTS", "Installments"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    package = models.ForeignKey(
        "services.ServicePackages",
        on_delete=models.PROTECT,
        related_name="bookings",
    )
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="package_bookings"
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="package_bookings",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    guest_numbers = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    # Price snapshot taken when the package is booked.
    package_price = models.DecimalField(max_digits=10, decimal_places=2)
    extra_guests_price = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    addons_price = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    # Payment is only recorded, not processed.
    payment_option = models.CharField(max_length=20, choices=PaymentOption.choices)
    deposit_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    installment_count = models.PositiveSmallIntegerField(null=True, blank=True)
    installment_interval = models.CharField(max_length=20, null=True, blank=True)
    installment_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    is_paid = models.BooleanField(default=False)

    schedule_deadline = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Every service must be scheduled before this time.",
    )

    location = models.CharField(max_length=255, blank=True)
    contact_detail_full_name = models.CharField(max_length=255)
    contact_detail_email = models.EmailField()
    contact_detail_phone_number = models.CharField(max_length=32)
    special_request = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(total_price__gte=0),
                name="package_booking_total_price_gte_0",
            ),
        ]

    @property
    def booking_status(self):
        """Status the package's service bookings should have."""
        if self.status == self.Status.COMPLETED:
            return Booking.VerificationStatus.COMPLETED
        return Booking.VerificationStatus(self.status)

    def __str__(self):
        return f"{self.customer} - {self.package} - {self.status}"


class PackageBookingItem(models.Model):
    """One service of a booked package, with its price at booking time."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    package_booking = models.ForeignKey(
        PackageBooking, on_delete=models.CASCADE, related_name="items"
    )
    service = models.ForeignKey(
        Service, on_delete=models.PROTECT, related_name="package_booking_items"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    is_addon = models.BooleanField(default=False)
    booking = models.OneToOneField(
        Booking,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="package_item",
        help_text="Empty until the customer picks a date for this service.",
    )

    class Meta:
        ordering = ["is_addon", "service__name"]
        constraints = [
            models.UniqueConstraint(
                fields=["package_booking", "service"],
                name="unique_service_per_package_booking",
            ),
        ]

    @property
    def line_total(self):
        return self.price * self.quantity

    def __str__(self):
        return f"{self.package_booking_id} - {self.service}"
