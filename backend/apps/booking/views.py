from apps.accounts.permissions import IsCustomer
from django.core.serializers import serialize
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from utils.response import success_response

from .models import Booking
from .serializers import BookingCancelSerializer, BookingSerializer


class BookingViewSet(ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        quesyset = Booking.objects.filter(customer=self.request.user)

        if self.action == "list":
            quesyset = quesyset.filter(
                status__in=[
                    Booking.VerificationStatus.CONFIRMED,
                    Booking.VerificationStatus.PENDING,
                ]
            )

        return quesyset

    @action(detail=True, methods=["patch"])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        serializer = BookingCancelSerializer(booking, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(
            data=serializer.data,
            message="Booking cancelled successfully",
            status_code=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="history-bookings")
    def history_bookings(self, request):
        bookings = self.get_queryset().filter(
            status__in=(
                [
                    Booking.VerificationStatus.CANCELLED,
                    Booking.VerificationStatus.REJECTED,
                    Booking.VerificationStatus.COMPLETED,
                ]
            )
        )
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = self.get_serializer(bookings, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(bookings, many=True)
        return success_response(
            data=serializer.data,
            message="Booking history retrieved successfully",
            status_code=status.HTTP_200_OK,
        )
