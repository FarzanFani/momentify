from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.companies.models import Company
from apps.services.models import (
    Service,
    ServiceCategory,
    ServicePackageItem,
    ServicePackages,
)

from .models import Booking, PackageBooking
from .tasks import completed_finished_bookings

User = get_user_model()


class PackageBookingTests(APITestCase):
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
        self.company = Company.objects.create(
            owner=self.provider, name="Acme", email="acme@example.com"
        )
        category = ServiceCategory.objects.create(name="Events")
        self.hall = self.make_service("Hall", category, "1000.00")
        self.camera = self.make_service("Camera", category, "500.00")
        self.drone = self.make_service("Drone", category, "200.00")

        self.package = ServicePackages.objects.create(
            name="Wedding",
            description="All in one",
            category=category,
            company=self.company,
            pricing_method=ServicePackages.PricingMethod.PERCENTAGE_DISCOUNT,
            percentage_discount=Decimal("10"),
            deposit_percentage=Decimal("20"),
            allow_scheduling_late=True,
            scheduling_deadline_days=30,
        )
        self.hall_item = self.add_item(self.hall, required=True)
        self.camera_item = self.add_item(self.camera, required=True)
        self.drone_item = self.add_item(self.drone, required=False)

        self.client.force_authenticate(self.customer)
        self.url = "/api/customer/package-bookings/"
        self.slot = (timezone.now() + timedelta(days=10)).replace(microsecond=0)

    def make_service(self, name, category, price):
        return Service.objects.create(
            company=self.company,
            name=name,
            description=name,
            category=category,
            duration_minutes=120,
            max_capacity=100,
            price=Decimal(price),
        )

    def add_item(self, service, required):
        return ServicePackageItem.objects.create(
            package=self.package, service=service, price=service.price,
            required=required,
        )

    def payload(self, **overrides):
        data = {
            "package": str(self.package.id),
            "guest_numbers": 20,
            "payment_option": "DEPOSIT",
            "contact_detail_full_name": "Sam Lee",
            "contact_detail_email": "sam@example.com",
            "contact_detail_phone_number": "123",
            "schedule": [
                {"item": str(self.hall_item.id), "starts_at": self.slot.isoformat()},
            ],
        }
        data.update(overrides)
        return data

    def book(self, **overrides):
        response = self.client.post(self.url, self.payload(**overrides), format="json")
        self.assertEqual(response.status_code, 201, response.content)
        return response.json()["data"]

    def test_book_with_partial_schedule_and_addon(self):
        data = self.book(addons=[str(self.drone_item.id)])

        self.assertEqual(data["status"], "PENDING")
        # (1000 + 500) * 0.9 + 200 add-on
        self.assertEqual(data["total_price"], "1550.00")
        self.assertEqual(data["deposit_amount"], "310.00")
        self.assertEqual(len(data["items"]), 3)
        self.assertEqual(data["unscheduled_count"], 2)
        self.assertIsNotNone(data["schedule_deadline"])

        service_booking = Booking.objects.get(package_booking_id=data["id"])
        self.assertEqual(service_booking.service, self.hall)
        self.assertEqual(service_booking.total_price, Decimal("0.00"))
        self.assertEqual(service_booking.status, "PENDING")

    def test_schedule_remaining_service_later(self):
        data = self.book()
        camera = next(i for i in data["items"] if i["service_name"] == "Camera")

        response = self.client.post(
            f"{self.url}{data['id']}/schedule/",
            {"schedule": [{"item": camera["id"], "starts_at": self.slot.isoformat()}]},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()["data"]["unscheduled_count"], 0)

    def test_scheduling_after_deadline_is_rejected(self):
        data = self.book()
        PackageBooking.objects.filter(id=data["id"]).update(
            schedule_deadline=timezone.now() - timedelta(days=1)
        )
        camera = next(i for i in data["items"] if i["service_name"] == "Camera")

        response = self.client.post(
            f"{self.url}{data['id']}/schedule/",
            {"schedule": [{"item": camera["id"], "starts_at": self.slot.isoformat()}]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertTrue(PackageBooking.objects.get(id=data["id"]).items.filter(
            service=self.camera, booking__isnull=True
        ).exists())

    def test_all_services_needed_when_late_scheduling_is_off(self):
        ServicePackages.objects.filter(id=self.package.id).update(
            allow_scheduling_late=False, scheduling_deadline_days=None
        )
        response = self.client.post(self.url, self.payload(), format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("schedule", response.json()["errors"])

    def test_payment_option_must_be_offered(self):
        response = self.client.post(
            self.url, self.payload(payment_option="INSTALLMENTS"), format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("payment_option", response.json()["errors"])

    def test_overlapping_slot_for_same_customer_is_rejected(self):
        self.book()
        response = self.client.post(self.url, self.payload(), format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("schedule", response.json()["errors"])

    def test_auto_approve_confirms_package_and_services(self):
        Company.objects.filter(id=self.company.id).update(auto_approve_booking=True)
        data = self.book()
        self.assertEqual(data["status"], "CONFIRMED")
        self.assertEqual(
            Booking.objects.get(package_booking_id=data["id"]).status, "CONFIRMED"
        )

    def test_customer_cannot_cancel_or_edit_package_services(self):
        data = self.book()
        booking = Booking.objects.get(package_booking_id=data["id"])

        cancel = self.client.patch(
            f"/api/customer/bookings/{booking.id}/cancel/",
            {"cancellation_reason": "no"},
            format="json",
        )
        delete = self.client.delete(f"/api/customer/bookings/{booking.id}/")
        package_delete = self.client.delete(f"{self.url}{data['id']}/")

        self.assertEqual(cancel.status_code, 400)
        self.assertEqual(delete.status_code, 400)
        self.assertEqual(package_delete.status_code, 405)

    def test_provider_approves_whole_package(self):
        data = self.book()
        self.client.force_authenticate(self.provider)

        single = Booking.objects.get(package_booking_id=data["id"])
        response = self.client.patch(
            f"/api/provider/bookings/{single.id}/", {"status": "CONFIRMED"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

        response = self.client.patch(
            f"/api/provider/package-bookings/{data['id']}/",
            {"status": "CONFIRMED"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.content)
        single.refresh_from_db()
        self.assertEqual(single.status, "CONFIRMED")

        # Services scheduled after approval are confirmed straight away.
        self.client.force_authenticate(self.customer)
        camera = next(i for i in data["items"] if i["service_name"] == "Camera")
        later = self.slot + timedelta(days=1)
        self.client.post(
            f"{self.url}{data['id']}/schedule/",
            {"schedule": [{"item": camera["id"], "starts_at": later.isoformat()}]},
            format="json",
        )
        self.assertEqual(
            Booking.objects.get(package_booking_id=data["id"], service=self.camera).status,
            "CONFIRMED",
        )

    def test_package_completes_when_all_services_finish(self):
        Company.objects.filter(id=self.company.id).update(auto_approve_booking=True)
        later = self.slot + timedelta(days=1)
        data = self.book(
            schedule=[
                {"item": str(self.hall_item.id), "starts_at": self.slot.isoformat()},
                {"item": str(self.camera_item.id), "starts_at": later.isoformat()},
            ]
        )
        Booking.objects.filter(package_booking_id=data["id"]).update(
            starts_at=timezone.now() - timedelta(hours=5),
            ends_at=timezone.now() - timedelta(hours=3),
        )

        completed_finished_bookings()

        self.assertEqual(PackageBooking.objects.get(id=data["id"]).status, "COMPLETED")

    def test_provider_summary_counts_package_revenue_once(self):
        self.book()
        self.client.force_authenticate(self.provider)
        response = self.client.get("/api/provider/bookings/summary/")
        self.assertEqual(response.json()["data"]["total_price"], 1350)
