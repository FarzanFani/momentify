from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.booking.models import Booking
from apps.companies.models import Company
from apps.services.models import Service, ServiceCategory

from .models import Review, ReviewReply

User = get_user_model()


class ReviewTestBase(APITestCase):
    def setUp(self):
        self.provider = User.objects.create_user(
            email="provider@example.com",
            password="pass12345",
            role="PROVIDER",
            first_name="Pat",
            last_name="Owner",
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
        self.service = Service.objects.create(
            company=self.company,
            name="Hall",
            description="Hall",
            category=ServiceCategory.objects.create(name="Venue"),
            duration_minutes=60,
            max_capacity=50,
            price=Decimal("100.00"),
        )
        self.booking = self.make_booking()

    def make_booking(self, customer=None, status=Booking.VerificationStatus.COMPLETED):
        starts_at = timezone.now() - timedelta(days=2)
        return Booking.objects.create(
            company=self.company,
            service=self.service,
            customer=customer or self.customer,
            guest_numbers=10,
            total_price=Decimal("100.00"),
            contact_detail_full_name="Sam Lee",
            contact_detail_email="sam@example.com",
            contact_detail_phone_number="123",
            event_type="Venue",
            starts_at=starts_at,
            ends_at=starts_at + timedelta(hours=1),
            status=status,
        )

    def make_review(self, booking=None, **extra):
        booking = booking or self.booking
        fields = {
            "company": booking.company,
            "booking": booking,
            "service": booking.service,
            "customer": booking.customer,
            "rating": 4,
            "comments": "Nice",
        }
        fields.update(extra)
        return Review.objects.create(**fields)


class CreateReviewTests(ReviewTestBase):
    def setUp(self):
        super().setUp()
        self.url = f"/api/bookings/{self.booking.id}/review/"
        self.client.force_authenticate(self.customer)

    def payload(self, **overrides):
        data = {"booking": str(self.booking.id), "rating": 5, "comments": "Great"}
        data.update(overrides)
        return data

    def test_review_completed_booking(self):
        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        review = Review.objects.get()
        self.assertEqual(review.booking, self.booking)
        self.assertEqual(review.customer, self.customer)
        self.assertEqual(review.company, self.company)
        self.assertEqual(review.service, self.service)
        self.assertEqual(review.rating, 5)
        self.assertEqual(response.json()["data"]["customer_name"], "Sam Lee")

    def test_anonymous_review_hides_name(self):
        response = self.client.post(
            self.url, self.payload(is_anonymous=True), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        self.assertEqual(response.json()["data"]["customer_name"], "Anonymous")

    def test_cannot_review_unfinished_booking(self):
        for booking_status in [
            Booking.VerificationStatus.PENDING,
            Booking.VerificationStatus.CONFIRMED,
            Booking.VerificationStatus.CANCELLED,
            Booking.VerificationStatus.REJECTED,
        ]:
            Booking.objects.filter(pk=self.booking.pk).update(status=booking_status)

            response = self.client.post(self.url, self.payload(), format="json")

            self.assertEqual(
                response.status_code, status.HTTP_400_BAD_REQUEST, booking_status
            )
        self.assertFalse(Review.objects.exists())

    def test_rating_must_be_between_1_and_5(self):
        for rating in [0, 6]:
            response = self.client.post(
                self.url, self.payload(rating=rating), format="json"
            )

            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, rating)
            self.assertIn("rating", response.json()["errors"])

    def test_requires_comments(self):
        response = self.client.post(self.url, self.payload(comments=""), format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("comments", response.json()["errors"])

    def test_cannot_review_twice(self):
        self.make_review()

        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 1)

    def test_cannot_review_other_customers_booking(self):
        self.client.force_authenticate(self.other_customer)

        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(Review.objects.exists())

    def test_provider_cannot_review(self):
        self.client.force_authenticate(self.provider)

        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_requires_authentication(self):
        self.client.force_authenticate(None)

        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ServiceReviewListTests(ReviewTestBase):
    def setUp(self):
        super().setUp()
        self.url = f"/api/services/{self.service.id}/reviews/"

    def test_public_list_of_service_reviews(self):
        review = self.make_review()
        anonymous = self.make_review(
            booking=self.make_booking(customer=self.other_customer),
            is_anonymous=True,
        )
        ReviewReply.objects.create(review=review, user=self.provider, message="Thanks")
        other_service = Service.objects.create(
            company=self.company,
            name="Garden",
            description="Garden",
            duration_minutes=60,
            max_capacity=50,
            price=Decimal("100.00"),
        )
        other_booking = self.make_booking()
        Booking.objects.filter(pk=other_booking.pk).update(service=other_service)
        self.make_review(booking=Booking.objects.get(pk=other_booking.pk))

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rows = {row["id"]: row for row in response.json()["data"]["results"]}
        self.assertEqual(set(rows), {str(review.id), str(anonymous.id)})
        self.assertEqual(rows[str(review.id)]["customer_name"], "Sam Lee")
        self.assertEqual(rows[str(review.id)]["reply"]["message"], "Thanks")
        self.assertEqual(rows[str(review.id)]["reply"]["user_name"], "Pat Owner")
        self.assertEqual(rows[str(anonymous.id)]["customer_name"], "Anonymous")
        self.assertIsNone(rows[str(anonymous.id)]["reply"])


class DeleteReviewTests(ReviewTestBase):
    def setUp(self):
        super().setUp()
        self.review = self.make_review()
        self.url = f"/api/review/{self.review.id}/"

    def test_customer_deletes_own_review(self):
        self.client.force_authenticate(self.customer)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Review.objects.exists())

    def test_cannot_delete_other_customers_review(self):
        self.client.force_authenticate(self.other_customer)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Review.objects.exists())

    def test_provider_cannot_delete_review(self):
        self.client.force_authenticate(self.provider)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ReviewReplyTests(ReviewTestBase):
    def setUp(self):
        super().setUp()
        self.review = self.make_review()
        self.url = f"/api/review/{self.review.id}/reply/"
        self.client.force_authenticate(self.provider)

    def payload(self, **overrides):
        data = {"review": str(self.review.id), "message": "Thank you!"}
        data.update(overrides)
        return data

    def test_provider_replies_to_review(self):
        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        reply = ReviewReply.objects.get()
        self.assertEqual(reply.review, self.review)
        self.assertEqual(reply.user, self.provider)
        self.assertEqual(response.json()["data"]["user_name"], "Pat Owner")

    def test_requires_message(self):
        response = self.client.post(self.url, self.payload(message="  "), format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("message", response.json()["errors"])

    def test_cannot_reply_twice(self):
        ReviewReply.objects.create(review=self.review, user=self.provider, message="Hi")

        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ReviewReply.objects.count(), 1)

    def test_other_provider_cannot_reply(self):
        self.client.force_authenticate(
            User.objects.create_user(
                email="rival@example.com", password="pass12345", role="PROVIDER"
            )
        )

        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(ReviewReply.objects.exists())

    def test_customer_cannot_reply(self):
        self.client.force_authenticate(self.customer)

        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
