from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.companies.models import Company
from apps.reviews.models import Review
from apps.services.models import Service, ServiceCategory

from .models import Booking, PackageBooking
from .tasks import completed_finished_bookings

User = get_user_model()


class BookingTestMixin:
    def setUp(self):
        self.provider = User.objects.create_user(
            email="provider@example.com", password="pass12345", role="PROVIDER"
        )
        self.customer = User.objects.create_user(
            email="customer@example.com",
            password="pass12345",
            role="CUSTOMER",
            first_name="Sam",
            last_name="Lee",
        )
        self.other_customer = User.objects.create_user(
            email="other@example.com", password="pass12345", role="CUSTOMER"
        )
        self.company = Company.objects.create(
            owner=self.provider, name="Acme", email="acme@example.com"
        )
        self.category = ServiceCategory.objects.create(name="Wedding")
        self.service = self.make_service("Hall")
        # Noon UTC keeps the same calendar date in the project time zone.
        self.slot = (timezone.now() + timedelta(days=10)).replace(
            hour=12, minute=0, second=0, microsecond=0
        )

    def make_service(self, name, company=None, **extra):
        fields = {
            "company": company or self.company,
            "name": name,
            "description": name,
            "category": self.category,
            "duration_minutes": 120,
            "max_capacity": 50,
            "price": Decimal("100.00"),
            "price_per_guest": Decimal("10.00"),
            "minimum_billable_guest": 5,
        }
        fields.update(extra)
        return Service.objects.create(**fields)

    def make_booking(self, customer=None, service=None, starts_at=None, **extra):
        service = service or self.service
        starts_at = starts_at or self.slot
        fields = {
            "company": service.company,
            "service": service,
            "customer": customer or self.customer,
            "guest_numbers": 10,
            "total_price": Decimal("150.00"),
            "contact_detail_full_name": "Sam Lee",
            "contact_detail_email": "sam@example.com",
            "contact_detail_phone_number": "123",
            "event_type": "Wedding",
            "starts_at": starts_at,
            "ends_at": starts_at + timedelta(minutes=service.duration_minutes),
        }
        fields.update(extra)
        return Booking.objects.create(**fields)


class CustomerBookingCreateTests(BookingTestMixin, APITestCase):
    url = "/api/customer/bookings/"

    def setUp(self):
        super().setUp()
        self.client.force_authenticate(self.customer)

    def payload(self, **overrides):
        data = {
            "service": str(self.service.id),
            "guest_numbers": 8,
            "location": "Vienna",
            "contact_detail_full_name": "Sam Lee",
            "contact_detail_email": "sam@example.com",
            "contact_detail_phone_number": "123",
            "special_request": "Flowers",
            "starts_at": self.slot.isoformat(),
        }
        data.update(overrides)
        return data

    def post(self, **overrides):
        return self.client.post(self.url, self.payload(**overrides), format="json")

    def test_create_booking(self):
        response = self.post()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        booking = Booking.objects.get()
        self.assertEqual(booking.customer, self.customer)
        self.assertEqual(booking.company, self.company)
        self.assertEqual(booking.status, Booking.VerificationStatus.PENDING)
        self.assertEqual(booking.event_type, "Wedding")
        self.assertEqual(booking.ends_at, self.slot + timedelta(minutes=120))
        # 100 base + 3 guests over the 5 included * 10
        self.assertEqual(booking.total_price, Decimal("130.00"))

        data = response.json()["data"]
        self.assertEqual(data["service_name"], "Hall")
        self.assertEqual(data["company_name"], "Acme")
        self.assertEqual(data["category_name"], "Wedding")
        self.assertEqual(data["customer_name"], "Sam Lee")
        self.assertIsNone(data["review"])
        self.assertIsNone(data["package_booking"])

    def test_read_only_fields_are_ignored(self):
        response = self.post(
            total_price="1.00",
            status="CONFIRMED",
            ends_at=(self.slot + timedelta(days=3)).isoformat(),
            is_paid=True,
            customer=str(self.other_customer.id),
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        booking = Booking.objects.get()
        self.assertEqual(booking.total_price, Decimal("130.00"))
        self.assertEqual(booking.status, Booking.VerificationStatus.PENDING)
        self.assertEqual(booking.ends_at, self.slot + timedelta(minutes=120))
        self.assertFalse(booking.is_paid)
        self.assertEqual(booking.customer, self.customer)

    def test_guests_within_minimum_pay_base_price(self):
        self.post(guest_numbers=3)

        self.assertEqual(Booking.objects.get().total_price, Decimal("100.00"))

    def test_fixed_guest_policy_uses_base_price(self):
        service = self.make_service(
            "Chapel", guest_count_policy="fixed", fixed_guest_count=20
        )

        response = self.post(service=str(service.id), guest_numbers=30)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.get().total_price, Decimal("100.00"))

    def test_service_without_category_has_empty_event_type(self):
        service = self.make_service("Plain", category=None)

        response = self.post(service=str(service.id))

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.get().event_type, "")
        self.assertIsNone(response.json()["data"]["category_name"])

    def test_auto_approve_company_confirms_booking(self):
        Company.objects.filter(pk=self.company.pk).update(auto_approve_booking=True)

        response = self.post()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.get().status, Booking.VerificationStatus.CONFIRMED)

    def test_rejects_past_start(self):
        response = self.post(starts_at=(timezone.now() - timedelta(hours=1)).isoformat())

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("starts_at", response.json()["errors"])
        self.assertFalse(Booking.objects.exists())

    def test_rejects_guests_over_capacity(self):
        response = self.post(guest_numbers=51)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("guest_numbers", response.json()["errors"])

    def test_rejects_zero_guests(self):
        response = self.post(guest_numbers=0)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("guest_numbers", response.json()["errors"])

    def test_requires_fields(self):
        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        errors = response.json()["errors"]
        for field in [
            "service",
            "guest_numbers",
            "contact_detail_full_name",
            "contact_detail_email",
            "contact_detail_phone_number",
            "starts_at",
        ]:
            self.assertIn(field, errors)

    def test_rejects_overlap_with_own_booking(self):
        self.make_booking()

        response = self.post(starts_at=(self.slot + timedelta(minutes=60)).isoformat())

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("starts_at", response.json()["errors"])

    def test_allows_back_to_back_booking(self):
        self.make_booking()

        response = self.post(starts_at=(self.slot + timedelta(minutes=120)).isoformat())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_cancelled_booking_does_not_block_slot(self):
        self.make_booking(
            status=Booking.VerificationStatus.CANCELLED, cancelled_at=timezone.now()
        )

        response = self.post()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_other_customer_overlap_allowed_without_auto_approve(self):
        self.make_booking(customer=self.other_customer)

        response = self.post()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_other_customer_overlap_blocked_with_auto_approve(self):
        Company.objects.filter(pk=self.company.pk).update(auto_approve_booking=True)
        self.make_booking(customer=self.other_customer)

        response = self.post()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["errors"]["starts_at"],
            ["Choose another time. Selected time is full"],
        )

    def test_provider_cannot_book(self):
        self.client.force_authenticate(self.provider)

        response = self.post()

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_requires_authentication(self):
        self.client.force_authenticate(None)

        response = self.post()

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CustomerBookingReadTests(BookingTestMixin, APITestCase):
    url = "/api/customer/bookings/"

    def setUp(self):
        super().setUp()
        self.client.force_authenticate(self.customer)

    def ids(self, response):
        return {row["id"] for row in response.json()["data"]["results"]}

    def test_list_shows_only_own_active_bookings(self):
        pending = self.make_booking()
        confirmed = self.make_booking(
            starts_at=self.slot + timedelta(days=1),
            status=Booking.VerificationStatus.CONFIRMED,
        )
        self.make_booking(
            starts_at=self.slot + timedelta(days=2),
            status=Booking.VerificationStatus.COMPLETED,
        )
        self.make_booking(customer=self.other_customer)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.ids(response), {str(pending.id), str(confirmed.id)})

    def test_history_shows_finished_bookings(self):
        self.make_booking()
        cancelled = self.make_booking(
            starts_at=self.slot + timedelta(days=1),
            status=Booking.VerificationStatus.CANCELLED,
            cancelled_at=timezone.now(),
        )
        rejected = self.make_booking(
            starts_at=self.slot + timedelta(days=2),
            status=Booking.VerificationStatus.REJECTED,
        )
        completed = self.make_booking(
            starts_at=self.slot + timedelta(days=3),
            status=Booking.VerificationStatus.COMPLETED,
        )
        self.make_booking(
            customer=self.other_customer, status=Booking.VerificationStatus.COMPLETED
        )

        response = self.client.get(f"{self.url}history-bookings/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            self.ids(response), {str(cancelled.id), str(rejected.id), str(completed.id)}
        )

    def test_history_is_paginated(self):
        for day in range(12):
            self.make_booking(
                starts_at=self.slot + timedelta(days=day),
                status=Booking.VerificationStatus.COMPLETED,
            )

        response = self.client.get(f"{self.url}history-bookings/")

        data = response.json()["data"]
        self.assertEqual(data["count"], 12)
        self.assertEqual(len(data["results"]), 10)

    def test_retrieve_own_booking(self):
        booking = self.make_booking()

        response = self.client.get(f"{self.url}{booking.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["id"], str(booking.id))

    def test_retrieve_other_customers_booking_is_404(self):
        booking = self.make_booking(customer=self.other_customer)

        response = self.client.get(f"{self.url}{booking.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_completed_booking_includes_review(self):
        booking = self.make_booking(status=Booking.VerificationStatus.COMPLETED)
        Review.objects.create(
            company=self.company,
            booking=booking,
            service=self.service,
            customer=self.customer,
            rating=5,
            comments="Great",
        )

        response = self.client.get(f"{self.url}{booking.id}/")

        self.assertEqual(response.json()["data"]["review"]["rating"], 5)

    def test_completed_booking_without_review(self):
        booking = self.make_booking(status=Booking.VerificationStatus.COMPLETED)

        response = self.client.get(f"{self.url}{booking.id}/")

        self.assertIsNone(response.json()["data"]["review"])


class CustomerBookingUpdateTests(BookingTestMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.booking = self.make_booking()
        self.url = f"/api/customer/bookings/{self.booking.id}/"
        self.client.force_authenticate(self.customer)

    def test_reschedule_recalculates_end_time(self):
        new_start = self.slot + timedelta(days=1)

        response = self.client.patch(
            self.url, {"starts_at": new_start.isoformat()}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.content)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.starts_at, new_start)
        self.assertEqual(self.booking.ends_at, new_start + timedelta(minutes=120))

    def test_changing_guests_recalculates_price(self):
        response = self.client.patch(self.url, {"guest_numbers": 20}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.total_price, Decimal("250.00"))

    def test_update_does_not_overlap_with_itself(self):
        response = self.client.patch(self.url, {"location": "Graz"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.location, "Graz")

    def test_reschedule_into_own_other_booking_is_rejected(self):
        other_start = self.slot + timedelta(days=1)
        self.make_booking(starts_at=other_start)

        response = self.client.patch(
            self.url, {"starts_at": other_start.isoformat()}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("starts_at", response.json()["errors"])

    def test_cannot_update_other_customers_booking(self):
        self.client.force_authenticate(self.other_customer)

        response = self.client.patch(self.url, {"location": "Graz"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_own_booking(self):
        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Booking.objects.filter(pk=self.booking.pk).exists())


class CustomerBookingCancelTests(BookingTestMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.booking = self.make_booking()
        self.url = f"/api/customer/bookings/{self.booking.id}/cancel/"
        self.client.force_authenticate(self.customer)

    def test_cancel_booking(self):
        response = self.client.patch(
            self.url, {"cancellation_reason": "Plans changed"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["message"], "Booking cancelled successfully")
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.VerificationStatus.CANCELLED)
        self.assertEqual(self.booking.cancellation_reason, "Plans changed")
        self.assertIsNotNone(self.booking.cancelled_at)

    def test_empty_reason_is_rejected(self):
        response = self.client.patch(self.url, {"cancellation_reason": ""}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cancellation_reason", response.json()["errors"])
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.VerificationStatus.PENDING)

    def test_missing_reason_is_rejected(self):
        response = self.client.patch(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["errors"]["cancellation_reason"],
            ["Cancellation reason is required"],
        )
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.VerificationStatus.PENDING)

    def test_confirmed_booking_can_be_cancelled(self):
        Booking.objects.filter(pk=self.booking.pk).update(
            status=Booking.VerificationStatus.CONFIRMED
        )

        response = self.client.patch(
            self.url, {"cancellation_reason": "Plans changed"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_only_active_bookings_can_be_cancelled(self):
        for booking_status in [
            Booking.VerificationStatus.COMPLETED,
            Booking.VerificationStatus.REJECTED,
            Booking.VerificationStatus.CANCELLED,
        ]:
            Booking.objects.filter(pk=self.booking.pk).update(status=booking_status)

            response = self.client.patch(
                self.url, {"cancellation_reason": "Too late"}, format="json"
            )

            self.assertEqual(
                response.status_code, status.HTTP_400_BAD_REQUEST, booking_status
            )
            self.assertIn("status", response.json()["errors"])
            self.booking.refresh_from_db()
            self.assertEqual(self.booking.status, booking_status)
            self.assertIsNone(self.booking.cancellation_reason)

    def test_cannot_cancel_other_customers_booking(self):
        self.client.force_authenticate(self.other_customer)

        response = self.client.patch(
            self.url, {"cancellation_reason": "Nope"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.VerificationStatus.PENDING)


class ProviderBookingListTests(BookingTestMixin, APITestCase):
    url = "/api/provider/bookings/"

    def setUp(self):
        super().setUp()
        other_provider = User.objects.create_user(
            email="rival@example.com", password="pass12345", role="PROVIDER"
        )
        rival = Company.objects.create(
            owner=other_provider, name="Rival", email="rival@example.com"
        )
        self.camera = self.make_service("Camera")
        self.confirmed = self.make_booking(
            status=Booking.VerificationStatus.CONFIRMED,
            starts_at=self.slot - timedelta(days=1),
        )
        self.pending_late = self.make_booking(starts_at=self.slot + timedelta(days=2))
        self.pending_early = self.make_booking(
            customer=self.other_customer, service=self.camera
        )
        self.foreign = self.make_booking(service=self.make_service("X", company=rival))
        self.client.force_authenticate(self.provider)

    def ids(self, response):
        return [row["id"] for row in response.json()["data"]["results"]]

    def test_lists_own_company_bookings_pending_first(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            self.ids(response),
            [str(self.pending_early.id), str(self.pending_late.id), str(self.confirmed.id)],
        )
        row = response.json()["data"]["results"][0]
        self.assertEqual(row["service_name"], "Camera")
        self.assertEqual(row["category_name"], "Wedding")

    def test_filter_by_status(self):
        response = self.client.get(self.url, {"status": "CONFIRMED"})

        self.assertEqual(self.ids(response), [str(self.confirmed.id)])

    def test_filter_by_service(self):
        response = self.client.get(self.url, {"service__id": str(self.camera.id)})

        self.assertEqual(self.ids(response), [str(self.pending_early.id)])

    def test_search_by_customer_email(self):
        response = self.client.get(self.url, {"search": "other@"})

        self.assertEqual(self.ids(response), [str(self.pending_early.id)])

    def test_filter_by_date_range(self):
        response = self.client.get(
            self.url,
            {"start_date": self.slot.date().isoformat(), "end_date": self.slot.date().isoformat()},
        )

        self.assertEqual(self.ids(response), [str(self.pending_early.id)])

    def test_invalid_date_is_rejected(self):
        response = self.client.get(self.url, {"start_date": "10-10-2026"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("start_date", response.json()["errors"])

    def test_retrieve_other_company_booking_is_404(self):
        response = self.client.get(f"{self.url}{self.foreign.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_customer_cannot_access(self):
        self.client.force_authenticate(self.customer)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_summary(self):
        self.make_booking(
            starts_at=self.slot + timedelta(days=5),
            status=Booking.VerificationStatus.CANCELLED,
            cancelled_at=timezone.now(),
        )
        self.make_booking(
            starts_at=self.slot + timedelta(days=6),
            status=Booking.VerificationStatus.COMPLETED,
        )

        response = self.client.get(f"{self.url}summary/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json()["data"],
            {
                # 4 active bookings * 150; cancelled and other company excluded
                "total_price": 600,
                "total_booking_count": 5,
                "pending_count": 2,
                "confirmed_count": 1,
                "completed_count": 1,
            },
        )


class ProviderBookingStatusTests(BookingTestMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.booking = self.make_booking()
        self.url = f"/api/provider/bookings/{self.booking.id}/"
        self.client.force_authenticate(self.provider)

    def test_confirm_pending_booking(self):
        response = self.client.patch(self.url, {"status": "CONFIRMED"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.VerificationStatus.CONFIRMED)

    def test_reject_pending_booking(self):
        response = self.client.patch(self.url, {"status": "REJECTED"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.VerificationStatus.REJECTED)

    def test_only_confirm_or_reject_allowed(self):
        for value in ["CANCELLED", "COMPLETED", "PENDING"]:
            response = self.client.patch(self.url, {"status": value}, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, value)

        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.VerificationStatus.PENDING)

    def test_non_pending_booking_cannot_change(self):
        Booking.objects.filter(pk=self.booking.pk).update(
            status=Booking.VerificationStatus.CONFIRMED
        )

        response = self.client.patch(self.url, {"status": "REJECTED"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.VerificationStatus.CONFIRMED)

    def test_put_and_delete_not_allowed(self):
        self.assertEqual(
            self.client.put(self.url, {"status": "CONFIRMED"}, format="json").status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )
        self.assertEqual(
            self.client.delete(self.url).status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def test_other_provider_cannot_change(self):
        self.client.force_authenticate(
            User.objects.create_user(
                email="rival@example.com", password="pass12345", role="PROVIDER"
            )
        )

        response = self.client.patch(self.url, {"status": "CONFIRMED"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CompleteFinishedBookingsTaskTests(BookingTestMixin, APITestCase):
    def test_completes_only_confirmed_finished_bookings(self):
        past = timezone.now() - timedelta(hours=5)
        finished = self.make_booking(
            starts_at=past, status=Booking.VerificationStatus.CONFIRMED
        )
        pending_past = self.make_booking(
            starts_at=past + timedelta(minutes=1), customer=self.other_customer
        )
        upcoming = self.make_booking(status=Booking.VerificationStatus.CONFIRMED)

        result = completed_finished_bookings()

        self.assertEqual(result, "1 bookings completed, 0 package bookings completed")
        finished.refresh_from_db()
        pending_past.refresh_from_db()
        upcoming.refresh_from_db()
        self.assertEqual(finished.status, Booking.VerificationStatus.COMPLETED)
        self.assertEqual(pending_past.status, Booking.VerificationStatus.PENDING)
        self.assertEqual(upcoming.status, Booking.VerificationStatus.CONFIRMED)


class BookingModelTests(BookingTestMixin, APITestCase):
    def test_clean_rejects_company_mismatch_and_over_capacity(self):
        other = Company.objects.create(
            owner=self.provider, name="Other", email="other@acme.com"
        )
        booking = Booking(
            company=other, service=self.service, guest_numbers=51, cancelled_at=timezone.now()
        )

        with self.assertRaises(ValidationError) as ctx:
            booking.clean()

        self.assertEqual(
            set(ctx.exception.message_dict), {"company", "guest_numbers", "cancelled_at"}
        )

    def test_clean_requires_cancelled_at_for_cancelled(self):
        booking = Booking(
            company=self.company,
            service=self.service,
            guest_numbers=1,
            status=Booking.VerificationStatus.CANCELLED,
        )

        with self.assertRaises(ValidationError) as ctx:
            booking.clean()

        self.assertIn("cancelled_at", ctx.exception.message_dict)

    def test_reserved_window_includes_buffers(self):
        service = self.make_service(
            "Buffered", buffer_before_minutes=15, buffer_after_minutes=30
        )
        booking = self.make_booking(service=service)

        self.assertEqual(booking.reserved_from, self.slot - timedelta(minutes=15))
        self.assertEqual(
            booking.reserved_until, self.slot + timedelta(minutes=120 + 30)
        )

    def test_package_booking_status_maps_to_booking_status(self):
        for package_status in PackageBooking.Status:
            package_booking = PackageBooking(status=package_status)
            self.assertEqual(package_booking.booking_status, package_status.value)
