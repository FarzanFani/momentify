from celery import shared_task
from django.utils import timezone

from .models import Booking


@shared_task
def completed_finished_bookings():
    completed_count = Booking.objects.filter(
        status=Booking.VerificationStatus.CONFIRMED,
        ends_at__lte=timezone.now(),
    ).update(
        status=Booking.VerificationStatus.COMPLETED,
        updated_at=timezone.now(),
    )

    return f"{completed_count} bookings completed"
