from datetime import datetime

from django.db import migrations
from django.utils import timezone


def populate_booking_datetimes(apps, schema_editor):
    Booking = apps.get_model("booking", "Booking")

    for booking in Booking.objects.filter(
        starts_at__isnull=True,
        ends_at__isnull=True,
    ).iterator():
        starts_at = datetime.combine(
            booking.event_date,
            booking.event_time,
        )
        ends_at = datetime.combine(
            booking.event_date,
            booking.event_end_time,
        )

        if timezone.is_naive(starts_at):
            starts_at = timezone.make_aware(
                starts_at,
                timezone.get_current_timezone(),
            )

        if timezone.is_naive(ends_at):
            ends_at = timezone.make_aware(
                ends_at,
                timezone.get_current_timezone(),
            )

        booking.starts_at = starts_at
        booking.ends_at = ends_at
        booking.save(
            update_fields=["starts_at", "ends_at"],
        )


def reverse_populate_booking_datetimes(apps, schema_editor):
    Booking = apps.get_model("booking", "Booking")

    for booking in Booking.objects.exclude(
        starts_at__isnull=True,
    ).iterator():
        local_start = timezone.localtime(booking.starts_at)
        local_end = timezone.localtime(booking.ends_at)

        booking.event_date = local_start.date()
        booking.event_time = local_start.time()
        booking.event_end_time = local_end.time()
        booking.save(
            update_fields=[
                "event_date",
                "event_time",
                "event_end_time",
            ],
        )


class Migration(migrations.Migration):
    dependencies = [
        ("booking", "0009_booking_ends_at_booking_starts_at"),
    ]

    operations = [
        migrations.RunPython(
            populate_booking_datetimes,
            reverse_populate_booking_datetimes,
        ),
    ]
