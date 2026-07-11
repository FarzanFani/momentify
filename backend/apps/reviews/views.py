from apps.accounts.permissions import IsCustomer, IsProvider
from apps.booking.models import Booking
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Review
from .serializers import PublicReviewSerializer, ReviewReplySerializer, ReviewSerializer


class CreateReviewView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def perform_create(self, serializer):
        booking_id = self.kwargs["booking_id"]

        booking = get_object_or_404(
            Booking,
            id=booking_id,
            customer=self.request.user,
        )

        if booking.status != Booking.VerificationStatus.COMPLETED:
            raise ValidationError("You can only review completed bookings.")

        serializer.save(
            customer=self.request.user,
            booking=booking,
            company=booking.company,
            service=booking.service,
        )


class ServiceReviewListView(generics.ListAPIView):
    serializer_class = PublicReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        service_id = self.kwargs["service_id"]
        return Review.objects.filter(service_id=service_id).select_related(
            "customer", "company", "booking", "service", "reply"
        )


class ReviewDestroyView(generics.DestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Review.objects.filter(customer=self.request.user)


class CreateReviewReplyView(generics.CreateAPIView):
    serializer_class = ReviewReplySerializer
    permission_classes = [IsAuthenticated, IsProvider]

    def perform_create(self, serializer):
        review_id = self.kwargs["review_id"]
        review = get_object_or_404(
            Review, id=review_id, company__owner=self.request.user
        )

        serializer.save(user=self.request.user, review=review)
