from datetime import datetime

from rest_framework.exceptions import ValidationError

from apps.accounts.permissions import IsCustomer, IsProvider
from django.db.models import Case, Count, IntegerField, Q, Sum, When, Value
from django.db.models.functions import Coalesce
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from utils.response import success_response

from .models import Booking
from .serializers import (
    BookingApprovedDeclinedProviderSerializer,
    BookingCancelSerializer,
    BookingSerializer,
    BookingsListSerializer,
)


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


class ProviderBookingViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated, IsProvider]
    http_method_names = ["get", "patch", "head", "options"]

    search_fields = [
        "customer__first_name",
        "customer__last_name",
        "customer__email",
        "service__name",
    ]
    filterset_fields = ["status", "service__id"]

    filter_backends = [SearchFilter, DjangoFilterBackend]

    def get_queryset(self):
        return (
            Booking.objects.filter(company__owner=self.request.user)
            .annotate(
                status_order=Case(
                    When(status=Booking.VerificationStatus.PENDING, then=0),
                    When(status=Booking.VerificationStatus.CONFIRMED, then=1),
                    When(status=Booking.VerificationStatus.REJECTED, then=2),
                    When(status=Booking.VerificationStatus.COMPLETED, then=3),
                    When(status=Booking.VerificationStatus.CANCELLED, then=4),
                    output_field=IntegerField(),
                )
            )
            .order_by("status_order", "event_date")
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if start_date:
            try:
                start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            except ValueError:
                raise ValidationError({"start_date": "Invalid date format"})

            queryset = queryset.filter(event_date__gte=start_date)

        if end_date:
            try:
                end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
            except ValueError:
                raise ValidationError({"end_date": "Invalid date format"})

            queryset = queryset.filter(event_date__lte=end_date)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(queryset, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.action == "partial_update":
            return BookingApprovedDeclinedProviderSerializer
        elif self.action == "list":
            return BookingsListSerializer
        return BookingSerializer

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        queryset = self.get_queryset()

        summary = queryset.aggregate(
            total_price=Coalesce(
                Sum(
                    "total_price",
                    filter=~Q(
                        status__in=[
                            Booking.VerificationStatus.CANCELLED,
                            Booking.VerificationStatus.REJECTED,
                        ]
                    ),
                ),
                Value(0),
                output_field=IntegerField(),
            ),
            total_booking_count=Count("id"),
            pending_count=Count(
                "id", filter=Q(status=Booking.VerificationStatus.PENDING)
            ),
            confirmed_count=Count(
                "id", filter=Q(status=Booking.VerificationStatus.CONFIRMED)
            ),
            completed_count=Count(
                "id",
                filter=Q(status=Booking.VerificationStatus.COMPLETED),
            ),
        )

        return Response(summary)
