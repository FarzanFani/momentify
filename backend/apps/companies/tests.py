import unittest
from datetime import time, timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    Company,
    CompanyCancellationPolicyRules,
    CompanyLocation,
    CompanyTimeOff,
    CompanyWorkingHours,
)

User = get_user_model()


class CompanyTestBase(APITestCase):
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
        self.company = Company.objects.create(
            owner=self.provider, name="Acme", email="acme@example.com"
        )
        self.rival = Company.objects.create(
            owner=self.other_provider, name="Rival", email="rival@example.com"
        )
        self.client.force_authenticate(self.provider)

    def complete_profile(self, company):
        CompanyLocation.objects.create(
            company=company, name="HQ", country="Austria", address="Main St 1"
        )
        CompanyWorkingHours.objects.create(
            company=company, weekday=0, start_time=time(9), end_time=time(17)
        )
        CompanyCancellationPolicyRules.objects.create(
            company=company,
            rule_description="Full refund",
            hours_before_event=48,
            refund_precentage=100,
        )


class CompanyTests(CompanyTestBase):
    url = "/api/companies/"

    def test_create_company(self):
        response = self.client.post(
            self.url,
            {
                "name": "New Co",
                "email": "new@example.com",
                "phone_number": "123",
                "verification_status": "APPROVED",
                "auto_approve_booking": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        company = Company.objects.get(email="new@example.com")
        self.assertEqual(company.owner, self.provider)
        self.assertEqual(company.verification_status, Company.VerificationStatus.PENDING)
        self.assertTrue(company.auto_approve_booking)
        data = response.json()["data"]
        self.assertFalse(data["is_profile_complete"])

    def test_create_requires_name_and_email(self):
        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.json()["errors"])
        self.assertIn("email", response.json()["errors"])

    def test_email_must_be_unique(self):
        response = self.client.post(
            self.url, {"name": "Copy", "email": "acme@example.com"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.json()["errors"])

    def test_list_only_own_companies(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [row["id"] for row in response.json()["data"]["results"]]
        self.assertEqual(ids, [str(self.company.id)])

    def test_search(self):
        Company.objects.create(owner=self.provider, name="Bloom", email="b@example.com")

        response = self.client.get(self.url, {"search": "bloom"})

        names = [row["name"] for row in response.json()["data"]["results"]]
        self.assertEqual(names, ["Bloom"])

    def test_profile_flags(self):
        CompanyLocation.objects.create(
            company=self.company, name="HQ", country="Austria", address="Main St 1"
        )

        data = self.client.get(f"{self.url}{self.company.id}/").json()["data"]

        self.assertTrue(data["has_location"])
        self.assertFalse(data["has_working_hours"])
        self.assertFalse(data["has_cancelation_policy"])
        self.assertFalse(data["is_profile_complete"])

        self.complete_profile(self.company)
        data = self.client.get(f"{self.url}{self.company.id}/").json()["data"]

        self.assertTrue(data["is_profile_complete"])

    def test_update_company(self):
        response = self.client.patch(
            f"{self.url}{self.company.id}/",
            {"name": "Acme Events", "owner": str(self.other_provider.id)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertEqual(self.company.name, "Acme Events")
        self.assertEqual(self.company.owner, self.provider)

    def test_delete_company(self):
        response = self.client.delete(f"{self.url}{self.company.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Company.objects.filter(pk=self.company.pk).exists())

    def test_cannot_access_other_providers_company(self):
        detail = f"{self.url}{self.rival.id}/"

        self.assertEqual(self.client.get(detail).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            self.client.patch(detail, {"name": "Mine"}, format="json").status_code,
            status.HTTP_404_NOT_FOUND,
        )
        self.assertEqual(
            self.client.delete(detail).status_code, status.HTTP_404_NOT_FOUND
        )
        self.assertEqual(
            self.client.get(f"{detail}preview/").status_code, status.HTTP_404_NOT_FOUND
        )

    def test_customer_cannot_manage_companies(self):
        self.client.force_authenticate(self.customer)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_preview_includes_profile_details(self):
        self.complete_profile(self.company)
        CompanyWorkingHours.objects.create(
            company=self.company, weekday=1, start_time=time(9), end_time=time(17)
        )

        response = self.client.get(f"{self.url}{self.company.id}/preview/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertEqual([loc["name"] for loc in data["locations"]], ["HQ"])
        self.assertEqual(len(data["cancellation_policy"]), 1)
        self.assertEqual(
            data["working_hours"],
            [
                {
                    "weekday": [0, 1],
                    "weekday_display": ["Monday", "Tuesday"],
                    "start_time": "09:00:00",
                    "end_time": "17:00:00",
                }
            ],
        )

    def test_tiny_list_only_complete_own_companies(self):
        self.complete_profile(self.company)
        self.complete_profile(self.rival)
        Company.objects.create(owner=self.provider, name="Draft", email="d@example.com")

        response = self.client.get(f"{self.url}tiny-list/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json()["data"], [{"id": str(self.company.id), "name": "Acme"}]
        )


class PublicCompanyTinyListTests(CompanyTestBase):
    url = "/api/public/companies/tiny-list/"

    def test_lists_complete_companies_without_auth(self):
        self.complete_profile(self.company)
        self.complete_profile(self.rival)
        self.client.force_authenticate(None)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            sorted(row["name"] for row in response.json()["data"]), ["Acme", "Rival"]
        )

    def test_hides_incomplete_companies(self):
        CompanyLocation.objects.create(
            company=self.company, name="HQ", country="Austria", address="Main St 1"
        )

        response = self.client.get(self.url)

        self.assertEqual(response.json()["data"], [])


class CompanyNestedTestBase(CompanyTestBase):
    resource = None

    def list_url(self, company=None):
        return f"/api/companies/{(company or self.company).id}/{self.resource}/"

    def detail_url(self, obj, company=None):
        return f"{self.list_url(company)}{obj.id}/"


class CompanyLocationTests(CompanyNestedTestBase):
    resource = "locations"

    def test_create_location(self):
        response = self.client.post(
            self.list_url(),
            {"name": "HQ", "country": "Austria", "address": "Main St 1"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        location = CompanyLocation.objects.get()
        self.assertEqual(location.company, self.company)
        self.assertEqual(location.city, "shiraz")

    def test_create_requires_fields(self):
        response = self.client.post(self.list_url(), {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        for field in ["name", "country", "address"]:
            self.assertIn(field, response.json()["errors"])

    def test_list_update_and_delete(self):
        location = CompanyLocation.objects.create(
            company=self.company, name="HQ", country="Austria", address="Main St 1"
        )
        CompanyLocation.objects.create(
            company=self.rival, name="Other", country="Austria", address="Side St"
        )

        listed = self.client.get(self.list_url()).json()["data"]["results"]
        self.assertEqual([row["name"] for row in listed], ["HQ"])

        response = self.client.patch(
            self.detail_url(location), {"city": "Vienna"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        location.refresh_from_db()
        self.assertEqual(location.city, "Vienna")

        response = self.client.delete(self.detail_url(location))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(CompanyLocation.objects.filter(pk=location.pk).exists())

    def test_cannot_use_other_providers_company(self):
        response = self.client.post(
            self.list_url(self.rival),
            {"name": "HQ", "country": "Austria", "address": "Main St 1"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            self.client.get(self.list_url(self.rival)).status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_cannot_reach_location_through_own_company(self):
        rival_location = CompanyLocation.objects.create(
            company=self.rival, name="Other", country="Austria", address="Side St"
        )

        response = self.client.get(self.detail_url(rival_location))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CompanyWorkingHoursTests(CompanyNestedTestBase):
    resource = "working-hours"

    def test_create_for_several_weekdays(self):
        response = self.client.post(
            self.list_url(),
            {"weekday": [0, 2, 4], "start_time": "09:00", "end_time": "17:00"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        self.assertEqual(
            sorted(self.company.working_hours.values_list("weekday", flat=True)),
            [0, 2, 4],
        )
        data = response.json()["data"]
        self.assertEqual(data["weekday"], [0, 2, 4])
        self.assertEqual(data["weekday_display"], ["Monday", "Wednesday", "Friday"])

    def test_creating_existing_hours_does_not_duplicate(self):
        CompanyWorkingHours.objects.create(
            company=self.company, weekday=0, start_time=time(9), end_time=time(17)
        )

        response = self.client.post(
            self.list_url(),
            {"weekday": [0, 1], "start_time": "09:00", "end_time": "17:00"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.company.working_hours.count(), 2)

    def test_rejects_duplicate_weekdays(self):
        response = self.client.post(
            self.list_url(),
            {"weekday": [1, 1], "start_time": "09:00", "end_time": "17:00"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("weekday", response.json()["errors"])

    def test_rejects_invalid_weekday_and_empty_list(self):
        for weekday in [[7], []]:
            response = self.client.post(
                self.list_url(),
                {"weekday": weekday, "start_time": "09:00", "end_time": "17:00"},
                format="json",
            )

            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, weekday)
            self.assertIn("weekday", response.json()["errors"])

    def test_end_must_be_after_start(self):
        response = self.client.post(
            self.list_url(),
            {"weekday": [0], "start_time": "17:00", "end_time": "09:00"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("end_time", response.json()["errors"])
        self.assertFalse(CompanyWorkingHours.objects.exists())

    def test_list_groups_weekdays_with_same_hours(self):
        for weekday in [0, 1]:
            CompanyWorkingHours.objects.create(
                company=self.company, weekday=weekday, start_time=time(9), end_time=time(17)
            )
        CompanyWorkingHours.objects.create(
            company=self.company, weekday=5, start_time=time(10), end_time=time(14)
        )
        CompanyWorkingHours.objects.create(
            company=self.rival, weekday=6, start_time=time(8), end_time=time(12)
        )

        response = self.client.get(self.list_url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json()["data"],
            [
                {
                    "weekday": [0, 1],
                    "weekday_display": ["Monday", "Tuesday"],
                    "start_time": "09:00:00",
                    "end_time": "17:00:00",
                },
                {
                    "weekday": [5],
                    "weekday_display": ["Saturday"],
                    "start_time": "10:00:00",
                    "end_time": "14:00:00",
                },
            ],
        )

    def test_retrieve_and_delete(self):
        hours = CompanyWorkingHours.objects.create(
            company=self.company, weekday=3, start_time=time(9), end_time=time(17)
        )

        response = self.client.get(self.detail_url(hours))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["weekday_display"], "Thursday")

        response = self.client.delete(self.detail_url(hours))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(CompanyWorkingHours.objects.exists())

    @unittest.expectedFailure
    def test_partial_update_checks_against_saved_times(self):
        # Bug: validate() only compares times sent in the request, so the DB
        # check constraint fails and the API returns 500.
        hours = CompanyWorkingHours.objects.create(
            company=self.company, weekday=3, start_time=time(9), end_time=time(17)
        )

        response = self.client.patch(
            self.detail_url(hours), {"start_time": "18:00"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_use_other_providers_company(self):
        response = self.client.post(
            self.list_url(self.rival),
            {"weekday": [0], "start_time": "09:00", "end_time": "17:00"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(CompanyWorkingHours.objects.exists())


class CompanyCancellationPolicyTests(CompanyNestedTestBase):
    resource = "cancellation-policy"

    def payload(self, **overrides):
        data = {
            "rule_description": "Half refund",
            "hours_before_event": 24,
            "refund_precentage": "50.00",
        }
        data.update(overrides)
        return data

    def test_create_rule(self):
        response = self.client.post(self.list_url(), self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        rule = CompanyCancellationPolicyRules.objects.get()
        self.assertEqual(rule.company, self.company)
        self.assertTrue(rule.is_active)

    def test_refund_percentage_between_0_and_100(self):
        for value in ["-1", "100.01"]:
            response = self.client.post(
                self.list_url(), self.payload(refund_precentage=value), format="json"
            )

            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, value)
            self.assertIn("refund_precentage", response.json()["errors"])

    def test_list_is_ordered_by_priority_then_hours(self):
        CompanyCancellationPolicyRules.objects.create(
            company=self.company, rule_description="B", hours_before_event=48,
            refund_precentage=100, priority=1,
        )
        CompanyCancellationPolicyRules.objects.create(
            company=self.company, rule_description="A", hours_before_event=24,
            refund_precentage=50, priority=1,
        )
        CompanyCancellationPolicyRules.objects.create(
            company=self.company, rule_description="C", hours_before_event=72,
            refund_precentage=100, priority=0,
        )

        response = self.client.get(self.list_url())

        descriptions = [row["rule_description"] for row in response.json()["data"]["results"]]
        self.assertEqual(descriptions, ["C", "A", "B"])

    def test_update_rule(self):
        rule = CompanyCancellationPolicyRules.objects.create(
            company=self.company, rule_description="A", hours_before_event=24,
            refund_precentage=50,
        )

        response = self.client.patch(
            self.detail_url(rule), {"is_active": False}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rule.refresh_from_db()
        self.assertFalse(rule.is_active)

    def test_cannot_use_other_providers_company(self):
        response = self.client.post(
            self.list_url(self.rival), self.payload(), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @unittest.expectedFailure
    def test_str(self):
        # Bug: __str__ uses self.name and self.refund_percentage, which don't exist.
        rule = CompanyCancellationPolicyRules(
            company=self.company, rule_description="Half refund",
            hours_before_event=24, refund_precentage=50,
        )

        self.assertEqual(str(rule), "Half refund - 50% refund")


class CompanyTimeOffTests(CompanyNestedTestBase):
    resource = "time-off"

    def setUp(self):
        super().setUp()
        self.start = (timezone.now() + timedelta(days=5)).replace(microsecond=0)

    def test_create_time_off(self):
        response = self.client.post(
            self.list_url(),
            {
                "start_datetime": self.start.isoformat(),
                "end_datetime": (self.start + timedelta(days=2)).isoformat(),
                "reason": "Holiday",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        time_off = CompanyTimeOff.objects.get()
        self.assertEqual(time_off.company, self.company)
        self.assertEqual(time_off.reason, "Holiday")

    def test_end_must_be_after_start(self):
        response = self.client.post(
            self.list_url(),
            {
                "start_datetime": self.start.isoformat(),
                "end_datetime": self.start.isoformat(),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("end_datetime", response.json()["errors"])

    def test_list_only_this_company(self):
        CompanyTimeOff.objects.create(
            company=self.company, start_datetime=self.start,
            end_datetime=self.start + timedelta(days=1),
        )
        CompanyTimeOff.objects.create(
            company=self.rival, start_datetime=self.start,
            end_datetime=self.start + timedelta(days=1),
        )

        response = self.client.get(self.list_url())

        self.assertEqual(response.json()["data"]["count"], 1)

    def test_cannot_use_other_providers_company(self):
        self.assertEqual(
            self.client.get(self.list_url(self.rival)).status_code,
            status.HTTP_404_NOT_FOUND,
        )

    @unittest.expectedFailure
    def test_partial_update_checks_against_saved_times(self):
        # Bug: validate() only compares datetimes sent in the request, so the DB
        # check constraint fails and the API returns 500.
        time_off = CompanyTimeOff.objects.create(
            company=self.company, start_datetime=self.start,
            end_datetime=self.start + timedelta(days=1),
        )

        response = self.client.patch(
            self.detail_url(time_off),
            {"end_datetime": (self.start - timedelta(days=1)).isoformat()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
