from datetime import datetime

from celery import shared_task
from django.utils import timezone

from .models import Booking


@shared_task
def completed_finished_bookings():
    now = timezone.localtime(timezone.now())

    bookings = Booking.objects.filter(
        status=Booking.VerificationStatus.CONFIRMED,
    )

    completed_count = 0

    for booking in bookings:
        end_datetime = datetime.combine(
            booking.event_date,
            booking.event_end_time,
        )

        if timezone.is_naive(end_datetime):
            end_datetime = timezone.make_aware(
                end_datetime,
                timezone.get_current_timezone(),
            )

        if end_datetime <= now:
            booking.status = Booking.VerificationStatus.COMPLETED
            booking.save(update_fields=["status", "updated_at"])
            completed_count += 1

    return f"{completed_count} bookings completed"
