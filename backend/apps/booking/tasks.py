from celery import shared_task
from django.utils import timezone

from .models import Booking, PackageBooking


@shared_task
def completed_finished_bookings():
    completed_count = Booking.objects.filter(
        status=Booking.VerificationStatus.CONFIRMED,
        ends_at__lte=timezone.now(),
    ).update(
        status=Booking.VerificationStatus.COMPLETED,
        updated_at=timezone.now(),
    )

    # A package is complete once every service is scheduled and finished.
    completed_packages = (
        PackageBooking.objects.filter(status=PackageBooking.Status.CONFIRMED)
        .exclude(items__booking__isnull=True)
        .exclude(
            bookings__status__in=[
                Booking.VerificationStatus.PENDING,
                Booking.VerificationStatus.CONFIRMED,
            ]
        )
        .update(status=PackageBooking.Status.COMPLETED, updated_at=timezone.now())
    )

    return (
        f"{completed_count} bookings completed, "
        f"{completed_packages} package bookings completed"
    )
