from email.policy import default
from django.db import models
import uuid
from django.conf import settings
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
        default=VerificationStatus.PENDING
    )
    timezone = models.CharField(max_length=64, default="UTC")

    auto_approve_booking = models.BooleanField(default=False)
    cancellation_policy_text = models.TextField(blank=True)

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
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="location")
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100, default="shiraz")
    country = models.CharField(max_length=100)
    address = models.TextField()
    latitude= models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    def __str__(self):
        return self.name
    class Meta:
        verbose_name = "Company Location"
        verbose_name_plural = "Company Locations"
        ordering = ["company", "name"]