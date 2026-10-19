from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework.test import APITestCase

from apps.companies.models import Company

from .models import Service, ServiceCategory, ServicePackages

User = get_user_model()

# 1x1 transparent GIF
TINY_GIF = (
    b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04"
    b"\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
)


class PackageTestBase(APITestCase):
    def setUp(self):
        self.provider = User.objects.create_user(
            email="provider@example.com",
            password="pass12345",
            role="PROVIDER",
        )
        self.company = Company.objects.create(
            owner=self.provider, name="Acme Events", email="acme@example.com"
        )
        self.venue = ServiceCategory.objects.create(name="Venue")
        self.photo = ServiceCategory.objects.create(name="Photography")

        self.hall = self.make_service("Hall", self.venue, "1000.00", capacity=150)
        self.camera = self.make_service("Camera", self.photo, "500.00", capacity=100)
        self.drone = self.make_service("Drone", self.photo, "200.00", capacity=300)

        self.client.force_authenticate(self.provider)
        self.url = f"/api/companies/{self.company.id}/packages/"

    def make_service(self, name, category, price, capacity):
        return Service.objects.create(
            company=self.company,
            name=name,
            description=name,
            category=category,
            duration_minutes=60,
            max_capacity=capacity,
            price=Decimal(price),
        )

    def payload(self, **overrides):
        data = {
            "name": "Wedding",
            "description": "Everything for the day",
            "category": self.venue.id,
            "pricing_method": "percentage_discount",
            "percentage_discount": "10",
            "allow_full_payment": True,
            "services": [
                {"service": str(self.hall.id), "quantity": 1, "required": True},
                {
                    "service": str(self.camera.id),
                    "quantity": 2,
                    "price": "400.00",
                    "required": True,
                },
                {"service": str(self.drone.id), "quantity": 1, "required": False},
            ],
        }
        data.update(overrides)
        return data

    def create_package(self, **overrides):
        response = self.client.post(self.url, self.payload(**overrides), format="json")
        self.assertEqual(response.status_code, 201, response.content)
        return response.json()["data"]


class PackagePricingTests(PackageTestBase):
    def test_breakdown_uses_item_price_quantity_and_skips_addons(self):
        data = self.create_package()

        # Hall 1000 + Camera 2 x 400 = 1800; drone is an add-on.
        self.assertEqual(data["services_subtotal"], "1800.00")
        self.assertEqual(data["addons_subtotal"], "200.00")
        self.assertEqual(data["total_price"], "1620.00")
        self.assertEqual(data["savings"], "180.00")
        self.assertEqual(data["max_guests"], 100)

    def test_services_from_other_categories_are_allowed(self):
        data = self.create_package()
        categories = {item["service_category_name"] for item in data["services"]}
        self.assertEqual(categories, {"Venue", "Photography"})

    def test_fixed_discount_is_subtracted(self):
        data = self.create_package(
            pricing_method="fixed_discount", fixed_discount="300"
        )
        self.assertEqual(data["total_price"], "1500.00")
        self.assertIsNone(data["percentage_discount"])

    def test_fixed_discount_must_be_below_subtotal(self):
        response = self.client.post(
            self.url,
            self.payload(pricing_method="fixed_discount", fixed_discount="1800"),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("fixed_discount", response.json()["errors"])

    def test_fixed_price_cannot_exceed_subtotal(self):
        response = self.client.post(
            self.url,
            self.payload(pricing_method="fixed_price", fixed_price="1900"),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("fixed_price", response.json()["errors"])

    def test_package_needs_a_required_service(self):
        services = self.payload()["services"]
        for item in services:
            item["required"] = False
        response = self.client.post(
            self.url, self.payload(services=services), format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("services", response.json()["errors"])

    def test_included_guests_limited_by_smallest_capacity(self):
        response = self.client.post(
            self.url, self.payload(included_guests=101), format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("included_guests", response.json()["errors"])

    def test_installment_amount_derived_from_count(self):
        data = self.create_package(installment_count=3, installment_interval="monthly")
        self.assertEqual(data["installment_amount"], "540.00")

    def test_installment_count_requires_interval(self):
        response = self.client.post(
            self.url, self.payload(installment_count=3), format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("installment_interval", response.json()["errors"])

    def test_update_can_clear_payment_plans(self):
        data = self.create_package(
            deposit_percentage="20", installment_count=3, installment_interval="weekly"
        )
        response = self.client.put(
            f"{self.url}{data['id']}/",
            self.payload(
                deposit_percentage=None,
                installment_count=None,
                installment_interval=None,
            ),
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.content)
        updated = response.json()["data"]
        self.assertIsNone(updated["deposit_percentage"])
        self.assertIsNone(updated["installment_count"])


class PackageLifecycleTests(PackageTestBase):
    def test_delete_package(self):
        data = self.create_package()
        response = self.client.delete(f"{self.url}{data['id']}/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(ServicePackages.objects.exists())

    def test_deleting_service_used_in_package_returns_clear_error(self):
        self.create_package()
        response = self.client.delete(
            f"/api/companies/{self.company.id}/services/{self.hall.id}/"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Wedding", str(response.json()["errors"]))

    @override_settings(MEDIA_ROOT="/tmp/momentify-test-media")
    def test_cover_image_upload_and_remove(self):
        data = self.create_package()
        url = f"{self.url}{data['id']}/cover-image/"

        image = SimpleUploadedFile("cover.gif", TINY_GIF, content_type="image/gif")
        response = self.client.post(url, {"cover_image": image}, format="multipart")
        self.assertEqual(response.status_code, 200, response.content)
        self.assertIn("packages/covers/", response.json()["data"]["cover_image"])

        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()["data"]["cover_image"])


class PublicPackageTests(PackageTestBase):
    def test_public_list_hides_inactive_packages_and_services(self):
        without_drone = self.payload()["services"][:2]
        self.create_package(name="Visible", services=without_drone)
        self.create_package(name="Hidden", services=without_drone, is_active=False)
        self.create_package(name="Uses drone")
        Service.objects.filter(id=self.drone.id).update(is_active=False)

        self.client.force_authenticate(None)
        response = self.client.get("/api/public/packages/")
        names = [p["name"] for p in response.json()["data"]["results"]]

        self.assertEqual(response.status_code, 200)
        self.assertEqual(names, ["Visible"])

    def test_calculate_price_with_guests_and_addons(self):
        data = self.create_package(included_guests=50, price_per_extra_guest="10")
        drone_item = next(i for i in data["services"] if not i["required"])

        self.client.force_authenticate(None)
        response = self.client.post(
            f"/api/public/packages/{data['id']}/calculate-price/",
            {"guest_count": 60, "addons": [drone_item["id"]]},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.content)
        result = response.json()["data"]
        self.assertEqual(result["package_price"], "1620.00")
        self.assertEqual(result["extra_guests_price"], "100.00")
        self.assertEqual(result["addons_price"], "200.00")
        self.assertEqual(result["total_price"], "1920.00")

    def test_calculate_price_rejects_too_many_guests(self):
        data = self.create_package()
        self.client.force_authenticate(None)
        response = self.client.post(
            f"/api/public/packages/{data['id']}/calculate-price/",
            {"guest_count": 101},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
