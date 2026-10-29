from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.booking.models import Booking
from apps.companies.models import Company
from apps.reviews.models import Review

from .models import Service, ServiceCategory

User = get_user_model()


class ServiceTestBase(APITestCase):
    def setUp(self):
        self.provider = User.objects.create_user(
            email="provider@example.com", password="pass12345", role="PROVIDER"
        )
        self.other_provider = User.objects.create_user(
            email="rival@example.com", password="pass12345", role="PROVIDER"
        )
        self.customer = User.objects.create_user(
            email="customer@example.com", password="pass12345", role="CUSTOMER"
        )
        self.admin = User.objects.create_user(
            email="admin@example.com", password="pass12345", role="ADMIN"
        )
        self.company = Company.objects.create(
            owner=self.provider, name="Acme", email="acme@example.com"
        )
        self.rival = Company.objects.create(
            owner=self.other_provider, name="Rival", email="rival@example.com"
        )
        self.venue = ServiceCategory.objects.create(name="Venue")
        self.photo = ServiceCategory.objects.create(name="Photography")

    def make_service(self, name, company=None, category=None, **extra):
        fields = {
            "company": company or self.company,
            "name": name,
            "description": name,
            "category": category or self.venue,
            "duration_minutes": 60,
            "max_capacity": 100,
            "price": Decimal("100.00"),
        }
        fields.update(extra)
        return Service.objects.create(**fields)


class CompanyServiceTests(ServiceTestBase):
    def setUp(self):
        super().setUp()
        self.url = f"/api/companies/{self.company.id}/services/"
        self.client.force_authenticate(self.provider)

    def payload(self, **overrides):
        data = {
            "name": "Hall",
            "description": "Big hall",
            "category": self.venue.id,
            "duration_minutes": 120,
            "max_capacity": 80,
            "minimum_billable_guest": 10,
            "price": "500.00",
            "price_per_guest": "5.00",
            "guest_count_policy": "variable",
        }
        data.update(overrides)
        return data

    def test_create_variable_service(self):
        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        service = Service.objects.get()
        self.assertEqual(service.company, self.company)
        self.assertEqual(service.max_capacity, 80)
        data = response.json()["data"]
        self.assertEqual(data["company_name"], "Acme")
        self.assertEqual(data["category_name"], "Venue")
        self.assertEqual(data["review"], [])

    def test_fixed_service_uses_fixed_count_for_capacity(self):
        response = self.client.post(
            self.url,
            self.payload(guest_count_policy="fixed", fixed_guest_count=30),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        service = Service.objects.get()
        self.assertEqual(service.max_capacity, 30)
        self.assertEqual(service.minimum_billable_guest, 30)

    def test_fixed_service_needs_fixed_count(self):
        response = self.client.post(
            self.url, self.payload(guest_count_policy="fixed"), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("fixed_guest_count", response.json()["errors"])

    def test_variable_service_needs_capacity(self):
        payload = self.payload()
        del payload["max_capacity"]

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("max_capacity", response.json()["errors"])

    def test_minimum_billable_cannot_exceed_capacity(self):
        response = self.client.post(
            self.url, self.payload(minimum_billable_guest=81), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("minimum_billable_guest", response.json()["errors"])

    def test_price_must_be_positive(self):
        response = self.client.post(self.url, self.payload(price="0"), format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("price", response.json()["errors"])

    def test_requires_category(self):
        response = self.client.post(self.url, self.payload(category=None), format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("category", response.json()["errors"])

    def test_variable_service_ignores_fixed_count(self):
        response = self.client.post(
            self.url, self.payload(fixed_guest_count=20), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        self.assertIsNone(Service.objects.get().fixed_guest_count)

    def test_switching_fixed_service_to_variable_clears_fixed_count(self):
        service = self.make_service(
            "Chapel", guest_count_policy="fixed", fixed_guest_count=20,
            max_capacity=20, minimum_billable_guest=20,
        )

        response = self.client.patch(
            f"{self.url}{service.id}/",
            {"guest_count_policy": "variable", "max_capacity": 60},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.content)
        service.refresh_from_db()
        self.assertIsNone(service.fixed_guest_count)
        self.assertEqual(service.max_capacity, 60)

    def test_list_search_and_tiny_list(self):
        hall = self.make_service("Hall")
        self.make_service("Camera", category=self.photo)
        self.make_service("Old", is_active=False)
        self.make_service("Rival hall", company=self.rival)

        listed = self.client.get(self.url).json()["data"]
        self.assertEqual(listed["count"], 3)

        searched = self.client.get(self.url, {"search": "photo"}).json()["data"]
        self.assertEqual([row["name"] for row in searched["results"]], ["Camera"])

        tiny = self.client.get(
            f"{self.url}tiny-list/", {"category_id": self.venue.id}
        ).json()["data"]
        self.assertEqual(
            tiny,
            [
                {
                    "id": str(hall.id),
                    "name": "Hall",
                    "price": "100.00",
                    "max_capacity": 100,
                    "category_name": "Venue",
                }
            ],
        )

    def test_update_service(self):
        service = self.make_service("Hall")

        response = self.client.patch(
            f"{self.url}{service.id}/", {"price": "250.00"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        service.refresh_from_db()
        self.assertEqual(service.price, Decimal("250.00"))

    def test_delete_unused_service(self):
        service = self.make_service("Hall")

        response = self.client.delete(f"{self.url}{service.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.exists())

    def test_delete_service_with_bookings_returns_clear_error(self):
        service = self.make_service("Hall")
        starts_at = timezone.now() + timedelta(days=3)
        Booking.objects.create(
            company=self.company, service=service, customer=self.customer,
            guest_numbers=5, total_price=Decimal("100.00"),
            contact_detail_full_name="Sam", contact_detail_email="s@example.com",
            contact_detail_phone_number="1", event_type="Venue",
            starts_at=starts_at, ends_at=starts_at + timedelta(hours=1),
        )

        response = self.client.delete(f"{self.url}{service.id}/")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("has bookings", response.json()["errors"]["service"])
        self.assertTrue(Service.objects.exists())

    def test_cannot_use_other_providers_company(self):
        url = f"/api/companies/{self.rival.id}/services/"

        self.assertEqual(self.client.get(url).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            self.client.post(url, self.payload(), format="json").status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_customer_cannot_manage_services(self):
        self.client.force_authenticate(self.customer)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_service_with_reviews_can_be_listed(self):
        service = self.make_service("Hall")
        starts_at = timezone.now() - timedelta(days=3)
        booking = Booking.objects.create(
            company=self.company, service=service, customer=self.customer,
            guest_numbers=5, total_price=Decimal("100.00"),
            contact_detail_full_name="Sam", contact_detail_email="s@example.com",
            contact_detail_phone_number="1", event_type="Venue",
            starts_at=starts_at, ends_at=starts_at + timedelta(hours=1),
            status=Booking.VerificationStatus.COMPLETED,
        )
        Review.objects.create(
            company=self.company, booking=booking, service=service,
            customer=self.customer, rating=5, comments="Great",
        )

        response = self.client.get(f"{self.url}{service.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]["review"]), 1)

    def test_service_without_category_can_be_read(self):
        service = self.make_service("Hall")
        Service.objects.filter(pk=service.pk).update(category=None)

        response = self.client.get(f"{self.url}{service.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.json()["data"]["category_name"])


class ProviderServiceTests(ServiceTestBase):
    url = "/api/provider/services/"

    def setUp(self):
        super().setUp()
        self.second = Company.objects.create(
            owner=self.provider, name="Bloom", email="bloom@example.com"
        )
        self.hall = self.make_service("Hall")
        self.camera = self.make_service("Camera", company=self.second, category=self.photo)
        self.make_service("Rival hall", company=self.rival)
        self.client.force_authenticate(self.provider)

    def names(self, response):
        return sorted(row["name"] for row in response.json()["data"]["results"])

    def test_lists_services_of_all_own_companies(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.names(response), ["Camera", "Hall"])

    def test_filter_by_company(self):
        response = self.client.get(self.url, {"company_id": str(self.second.id)})

        self.assertEqual(self.names(response), ["Camera"])

    def test_filter_by_several_companies(self):
        response = self.client.get(
            self.url, {"company_id": f"{self.company.id},{self.second.id}"}
        )

        self.assertEqual(self.names(response), ["Camera", "Hall"])

    def test_invalid_company_id(self):
        response = self.client.get(self.url, {"company_id": "nope"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("company_id", response.json()["errors"])

    def test_filter_by_category(self):
        response = self.client.get(self.url, {"category_id": str(self.photo.id)})

        self.assertEqual(self.names(response), ["Camera"])

    def test_invalid_category_id(self):
        response = self.client.get(self.url, {"category_id": "abc"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_other_providers_service_is_404(self):
        rival_service = Service.objects.get(name="Rival hall")

        response = self.client.get(f"{self.url}{rival_service.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_read_only(self):
        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class PublicServiceTests(ServiceTestBase):
    url = "/api/public/services/"

    def setUp(self):
        super().setUp()
        self.hall = self.make_service("Hall", max_capacity=200, price=Decimal("1000.00"))
        self.camera = self.make_service(
            "Camera", category=self.photo, max_capacity=20, price=Decimal("300.00")
        )
        self.rival_hall = self.make_service(
            "Rival hall", company=self.rival, max_capacity=50, price=Decimal("600.00")
        )
        self.hidden = self.make_service("Hidden", is_active=False)

    def names(self, response):
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.content)
        return sorted(row["name"] for row in response.json()["data"]["results"])

    def test_lists_active_services_without_auth(self):
        response = self.client.get(self.url)

        self.assertEqual(self.names(response), ["Camera", "Hall", "Rival hall"])

    def test_inactive_service_is_404(self):
        response = self.client.get(f"{self.url}{self.hidden.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_filters(self):
        cases = [
            ({"company_id": str(self.rival.id)}, ["Rival hall"]),
            ({"category_id": f"{self.photo.id}"}, ["Camera"]),
            ({"category_id": f"{self.photo.id},{self.venue.id}"}, ["Camera", "Hall", "Rival hall"]),
            ({"max_capacity": "50"}, ["Hall", "Rival hall"]),
            ({"min_price": "500"}, ["Hall", "Rival hall"]),
            ({"max_price": "600"}, ["Camera", "Rival hall"]),
            ({"min_price": "500", "max_price": "700"}, ["Rival hall"]),
            ({"search": "camera"}, ["Camera"]),
        ]
        for params, expected in cases:
            with self.subTest(params=params):
                self.assertEqual(self.names(self.client.get(self.url, params)), expected)

    def test_invalid_filters(self):
        for param, value in [
            ("company_id", "nope"),
            ("category_id", "abc"),
            ("max_capacity", "many"),
            ("min_price", "cheap"),
            ("max_price", "pricey"),
        ]:
            with self.subTest(param=param):
                response = self.client.get(self.url, {param: value})

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn(param, response.json()["errors"])

    def test_read_only(self):
        self.client.force_authenticate(self.provider)

        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class ServiceCategoryTests(ServiceTestBase):
    url = "/api/services/categories/"

    def test_public_list_hides_inactive(self):
        ServiceCategory.objects.create(name="Retired", is_active=False)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = sorted(row["name"] for row in response.json()["data"]["results"])
        self.assertEqual(names, ["Photography", "Venue"])

    def test_tiny_list_is_sorted_and_unpaginated(self):
        ServiceCategory.objects.create(name="Retired", is_active=False)

        response = self.client.get(f"{self.url}tiny-list/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [row["name"] for row in response.json()["data"]], ["Photography", "Venue"]
        )

    def test_admin_creates_category_with_slug(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            self.url, {"name": "Live Music", "slug": "ignored"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        self.assertEqual(ServiceCategory.objects.get(name="Live Music").slug, "live-music")

    def test_category_name_must_be_unique(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(self.url, {"name": "Venue"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.json()["errors"])

    def test_admin_updates_and_deletes_category(self):
        self.client.force_authenticate(self.admin)
        detail = f"{self.url}{self.photo.id}/"

        response = self.client.patch(detail, {"name": "Photo"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.photo.refresh_from_db()
        self.assertEqual(self.photo.name, "Photo")

        response = self.client.delete(detail)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ServiceCategory.objects.filter(pk=self.photo.pk).exists())

    def test_non_admins_cannot_change_categories(self):
        for user in [self.provider, self.customer]:
            self.client.force_authenticate(user)

            response = self.client.post(self.url, {"name": "New"}, format="json")

            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN, user.role)
        self.assertFalse(ServiceCategory.objects.filter(name="New").exists())

    def test_anonymous_cannot_change_categories(self):
        response = self.client.post(self.url, {"name": "New"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CalculatedPriceTests(ServiceTestBase):
    url = "/api/services/price"

    def setUp(self):
        super().setUp()
        self.service = self.make_service(
            "Hall",
            minimum_billable_guest=10,
            price_per_guest=Decimal("5.00"),
        )
        self.client.force_authenticate(self.customer)

    def test_calculates_variable_price(self):
        response = self.client.post(
            self.url, {"service": str(self.service.id), "guest_count": 15}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["calculated_price"], 125)

    def test_guests_within_minimum_pay_base_price(self):
        response = self.client.post(
            self.url, {"service": str(self.service.id), "guest_count": 4}, format="json"
        )

        self.assertEqual(response.json()["data"]["calculated_price"], 100)

    def test_fixed_service_is_rejected(self):
        fixed = self.make_service(
            "Chapel", guest_count_policy="fixed", fixed_guest_count=20,
            max_capacity=20, minimum_billable_guest=20,
        )

        response = self.client.post(
            self.url, {"service": str(fixed.id), "guest_count": 20}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_validates_input(self):
        response = self.client.post(
            self.url, {"service": str(self.provider.id), "guest_count": 0}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("service", response.json()["errors"])
        self.assertIn("guest_count", response.json()["errors"])

    def test_only_customers(self):
        self.client.force_authenticate(self.provider)

        response = self.client.post(
            self.url, {"service": str(self.service.id), "guest_count": 15}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
