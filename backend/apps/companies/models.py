import uuid
from email.policy import default

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Company(models.Model):

    class VerificationStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_companies",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    logo = models.ImageField(upload_to="companies/logos/", blank=True, null=True)

    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )
    timezone = models.CharField(max_length=64, default="UTC")

    auto_approve_booking = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ["name"]


class CompanyLocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="location"
    )
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100, default="shiraz")
    country = models.CharField(max_length=100)
    address = models.TextField()
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Company Location"
        verbose_name_plural = "Company Locations"
        ordering = ["company", "name"]


class CompanyCancellationPolicyRules(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="cancellation_policy"
    )
    rule_description = models.CharField(max_length=255)
    hours_before_event = models.PositiveIntegerField()
    refund_precentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    priority = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "company_cancellation_policy_rules"
        ordering = ["priority", "hours_before_event"]
        verbose_name = "Cancellation Policy Rule"
        verbose_name_plural = "Cancellation Policy Rules"

    def __str__(self):
        return f"{self.name} - {self.refund_percentage}% refund"


class CompanyWorkingHours(models.Model):
    class weekday(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    company = models.ForeignKey(
        "Company", on_delete=models.CASCADE, related_name="working_hours"
    )
    weekday = models.PositiveSmallIntegerField(
        choices=weekday.choices, validators=[MinValueValidator(0), MaxValueValidator(6)]
    )
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        db_table = "company_working_hours"
        ordering = ["weekday", "start_time"]
        verbose_name = "Working Hour"
        verbose_name_plural = "Working Hours"
        constraints = [
            models.UniqueConstraint(
                fields=["company", "weekday", "start_time", "end_time"],
                name="unique_company_working_hours",
            ),
            models.CheckConstraint(
                check=models.Q(start_time__lt=models.F("end_time")),
                name="working_hours_start_before_end",
            ),
        ]

    def __str__(self):
        return (
            f"{self.company} - {self.get_weekday_display()} "
            f"{self.start_time} to {self.end_time}"
        )


class CompanyTimeOff(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    company = models.ForeignKey(
        "Company",
        on_delete=models.CASCADE,
        related_name="time_offs",
    )

    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "company_time_off"
        ordering = ["start_datetime"]
        verbose_name = "Time Off"
        verbose_name_plural = "Time Off"
        constraints = [
            models.CheckConstraint(
                check=models.Q(start_datetime__lt=models.F("end_datetime")),
                name="time_off_start_before_end",
            ),
        ]

    def __str__(self):
        return f"{self.company} - {self.start_datetime} to {self.end_datetime}"
