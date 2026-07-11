import uuid
from email import message
from tabnanny import verbose

from apps.accounts.models import User
from apps.booking.models import Booking
from apps.companies.models import Company
from apps.services.models import Service
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="reviews"
    )
    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name="review"
    )
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE, related_name="reviews"
    )
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews")
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comments = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        constraints = [
            models.UniqueConstraint(
                fields=["booking", "customer"],
                name="unique_review_per_customer_per_booking",
            )
        ]

    def __str__(self):
        return f"{self.comments} - {self.customer}"


class ReviewReply(models.Model):
    review = models.OneToOneField(
        Review, on_delete=models.CASCADE, related_name="reply"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="review_replies"
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Reply"
        verbose_name_plural = "Replies"

    def __str__(self):
        return f"{self.review} -> {self.message}"
