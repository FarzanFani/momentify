import uuid

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from apps.companies.models import Company

User = get_user_model()


class AccountsTestMixin:
    password = "pass12345"

    def make_user(self, email, role="CUSTOMER", **extra):
        extra.setdefault("first_name", "Test")
        extra.setdefault("last_name", "User")
        return User.objects.create_user(
            email=email, password=self.password, role=role, **extra
        )

    def make_admin(self, email="admin@example.com"):
        # IsAdminUser checks is_staff, not the ADMIN role
        return self.make_user(email, role="ADMIN", is_staff=True)


class UserRegisterTests(AccountsTestMixin, APITestCase):
    url = "/api/accounts/register/"

    def payload(self, **overrides):
        data = {
            "first_name": "Sam",
            "last_name": "Lee",
            "email": "sam@example.com",
            "password": "strongpass1",
            "phone_number": "+43123456",
        }
        data.update(overrides)
        return data

    def test_register_creates_customer_by_default(self):
        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.json()["success"])
        self.assertEqual(response.json()["message"], "Registration successful")
        self.assertNotIn("password", response.json()["data"])

        user = User.objects.get(email="sam@example.com")
        self.assertEqual(user.role, User.Role.CUSTOMER)
        self.assertEqual(user.phone_number, "+43123456")
        self.assertTrue(user.check_password("strongpass1"))
        self.assertFalse(user.is_verified)

    def test_register_with_provider_role(self):
        response = self.client.post(
            self.url, self.payload(role="PROVIDER"), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            User.objects.get(email="sam@example.com").role, User.Role.PROVIDER
        )

    def test_register_normalizes_email_domain(self):
        response = self.client.post(
            self.url, self.payload(email="sam@EXAMPLE.COM"), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="sam@example.com").exists())

    def test_register_rejects_short_password(self):
        response = self.client.post(
            self.url, self.payload(password="short"), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.json()["success"])
        self.assertEqual(
            response.json()["errors"]["password"],
            ["Password must be at least 8 characters long"],
        )
        self.assertFalse(User.objects.exists())

    def test_register_rejects_duplicate_email(self):
        self.make_user("sam@example.com")

        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.json()["errors"])
        self.assertEqual(User.objects.filter(email="sam@example.com").count(), 1)

    def test_register_rejects_invalid_email(self):
        response = self.client.post(
            self.url, self.payload(email="not-an-email"), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.json()["errors"])

    def test_register_rejects_invalid_role(self):
        response = self.client.post(
            self.url, self.payload(role="SUPERHERO"), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("role", response.json()["errors"])

    def test_register_requires_fields(self):
        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        for field in ["first_name", "last_name", "email", "password"]:
            self.assertIn(field, response.json()["errors"])


class UserAddTests(AccountsTestMixin, APITestCase):
    url = "/api/accounts/add/"

    def setUp(self):
        self.admin = self.make_admin()

    def payload(self, **overrides):
        data = {
            "first_name": "New",
            "last_name": "Provider",
            "email": "new@example.com",
            "role": "PROVIDER",
            "phone_number": "+43999",
        }
        data.update(overrides)
        return data

    def test_admin_can_add_user(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["message"], "User added successfully")
        user = User.objects.get(email="new@example.com")
        self.assertEqual(user.role, User.Role.PROVIDER)
        self.assertFalse(user.has_usable_password())

    def test_add_requires_all_fields(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        for field in ["first_name", "last_name", "email", "role", "phone_number"]:
            self.assertIn(field, response.json()["errors"])

    def test_add_rejects_duplicate_email(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            self.url, self.payload(email=self.admin.email), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.json()["errors"])

    def test_non_staff_user_cannot_add_user(self):
        self.client.force_authenticate(self.make_user("customer@example.com"))

        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(User.objects.filter(email="new@example.com").exists())

    def test_admin_role_without_staff_flag_cannot_add_user(self):
        self.client.force_authenticate(self.make_user("role@example.com", role="ADMIN"))

        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_add_user(self):
        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.json()["success"])


class MeTests(AccountsTestMixin, APITestCase):
    url = "/api/accounts/me/"

    def test_returns_current_user(self):
        user = self.make_user("me@example.com", first_name="Me", phone_number="123")
        self.client.force_authenticate(user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertEqual(data["id"], str(user.id))
        self.assertEqual(data["email"], "me@example.com")
        self.assertEqual(data["first_name"], "Me")
        self.assertEqual(data["role"], "CUSTOMER")
        self.assertEqual(data["phone_number"], "123")
        self.assertFalse(data["has_company_registered"])

    def test_provider_without_company(self):
        self.client.force_authenticate(self.make_user("p@example.com", role="PROVIDER"))

        response = self.client.get(self.url)

        self.assertFalse(response.json()["data"]["has_company_registered"])

    def test_provider_with_company(self):
        provider = self.make_user("p@example.com", role="PROVIDER")
        Company.objects.create(owner=provider, name="Acme", email="acme@example.com")
        self.client.force_authenticate(provider)

        response = self.client.get(self.url)

        self.assertTrue(response.json()["data"]["has_company_registered"])

    def test_requires_authentication(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_works_with_jwt_bearer_token(self):
        user = self.make_user("jwt@example.com")
        token = AccessToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["email"], "jwt@example.com")

    def test_rejects_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalid")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProviderDashboardTests(AccountsTestMixin, APITestCase):
    url = "/api/accounts/provider/dashboard/"

    def test_provider_can_access(self):
        self.client.force_authenticate(self.make_user("p@example.com", role="PROVIDER"))

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["message"], "Welcome Provider")

    def test_customer_is_forbidden(self):
        self.client.force_authenticate(self.make_user("c@example.com"))

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_is_forbidden(self):
        self.client.force_authenticate(self.make_admin())

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_requires_authentication(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserListTests(AccountsTestMixin, APITestCase):
    url = "/api/accounts/users/"

    def setUp(self):
        self.admin = self.make_admin()
        self.alice = self.make_user(
            "alice@example.com", first_name="Alice", last_name="Zed",
            is_verified=True,
        )
        self.bob = self.make_user(
            "bob@example.com", role="PROVIDER", first_name="Bob",
            last_name="Young", is_active=False,
        )
        self.carol = self.make_user(
            "carol@example.com", role="PROVIDER", first_name="Carol",
            last_name="Xu", is_verified=True,
        )
        self.client.force_authenticate(self.admin)

    def emails(self, response):
        return {row["email"] for row in response.json()["data"]["results"]}

    def test_admin_lists_all_users_paginated(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertEqual(data["count"], 4)
        self.assertEqual(
            set(data["results"][0].keys()),
            {"id", "email", "first_name", "last_name", "role",
             "phone_number", "is_verified", "is_active"},
        )

    def test_page_size_param(self):
        response = self.client.get(self.url, {"page_size": 2})

        self.assertEqual(len(response.json()["data"]["results"]), 2)
        self.assertIsNotNone(response.json()["data"]["next"])

    def test_filter_by_role(self):
        response = self.client.get(self.url, {"role": "PROVIDER"})

        self.assertEqual(self.emails(response), {"bob@example.com", "carol@example.com"})

    def test_filter_by_role_in(self):
        response = self.client.get(self.url, {"role__in": "CUSTOMER, ADMIN"})

        self.assertEqual(self.emails(response), {"alice@example.com", "admin@example.com"})

    def test_role_in_takes_precedence_over_role(self):
        response = self.client.get(
            self.url, {"role__in": "CUSTOMER", "role": "PROVIDER"}
        )

        self.assertEqual(self.emails(response), {"alice@example.com"})

    def test_filter_by_is_verified(self):
        response = self.client.get(self.url, {"is_verified": "true"})

        self.assertEqual(self.emails(response), {"alice@example.com", "carol@example.com"})

    def test_filter_by_is_active(self):
        response = self.client.get(self.url, {"is_active": "false"})

        self.assertEqual(self.emails(response), {"bob@example.com"})

    def test_search(self):
        response = self.client.get(self.url, {"search": "carol"})

        self.assertEqual(self.emails(response), {"carol@example.com"})

    def test_ordering(self):
        response = self.client.get(
            self.url, {"role__in": "CUSTOMER,PROVIDER", "ordering": "-last_name"}
        )

        names = [row["last_name"] for row in response.json()["data"]["results"]]
        self.assertEqual(names, ["Zed", "Young", "Xu"])

    def test_non_staff_is_forbidden(self):
        self.client.force_authenticate(self.alice)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_requires_authentication(self):
        self.client.force_authenticate(None)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserUpdateTests(AccountsTestMixin, APITestCase):
    def setUp(self):
        self.admin = self.make_admin()
        self.user = self.make_user("user@example.com")
        self.url = f"/api/accounts/users/{self.user.id}/"
        self.client.force_authenticate(self.admin)

    def test_patch_updates_flags(self):
        response = self.client.patch(
            self.url, {"is_verified": True, "is_active": False}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["message"], "User updated successfully")
        self.assertEqual(
            response.json()["data"], {"is_verified": True, "is_active": False}
        )
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_verified)
        self.assertFalse(self.user.is_active)

    def test_put_is_partial(self):
        response = self.client.put(self.url, {"is_verified": True}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_verified)
        self.assertTrue(self.user.is_active)

    def test_ignores_fields_outside_serializer(self):
        response = self.client.patch(
            self.url, {"role": "ADMIN", "email": "hacked@example.com"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, User.Role.CUSTOMER)
        self.assertEqual(self.user.email, "user@example.com")

    def test_invalid_value_returns_400(self):
        response = self.client.patch(
            self.url, {"is_active": "not-a-bool"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()["message"], "User update failed")
        self.assertIn("is_active", response.json()["errors"])

    def test_unknown_user_returns_404(self):
        response = self.client.patch(
            f"/api/accounts/users/{uuid.uuid4()}/", {"is_verified": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()["message"], "User not found")

    def test_get_not_allowed(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_non_staff_is_forbidden(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(self.url, {"is_verified": True}, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_verified)

    def test_requires_authentication(self):
        self.client.force_authenticate(None)

        response = self.client.patch(self.url, {"is_verified": True}, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TokenTests(AccountsTestMixin, APITestCase):
    url = "/api/token/"
    refresh_url = "/api/token/refresh/"

    def setUp(self):
        self.user = self.make_user(
            "login@example.com", role="PROVIDER", first_name="Lo", last_name="Gin"
        )

    def test_obtain_token_includes_custom_claims(self):
        response = self.client.post(
            self.url, {"email": "login@example.com", "password": self.password},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("refresh", data)
        token = AccessToken(data["access"])
        self.assertEqual(token["user_id"], str(self.user.id))
        self.assertEqual(token["role"], "PROVIDER")
        self.assertEqual(token["email"], "login@example.com")
        self.assertEqual(token["first_name"], "Lo")
        self.assertEqual(token["last_name"], "Gin")

    def test_wrong_password(self):
        response = self.client.post(
            self.url, {"email": "login@example.com", "password": "wrong-pass"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.json()["success"])

    def test_inactive_user_cannot_login(self):
        self.user.is_active = False
        self.user.save()

        response = self.client.post(
            self.url, {"email": "login@example.com", "password": self.password},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_returns_new_access_token(self):
        tokens = self.client.post(
            self.url, {"email": "login@example.com", "password": self.password},
            format="json",
        ).json()["data"]

        response = self.client.post(
            self.refresh_url, {"refresh": tokens["refresh"]}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.json()["data"])

    def test_refresh_rejects_invalid_token(self):
        response = self.client.post(
            self.refresh_url, {"refresh": "invalid"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
