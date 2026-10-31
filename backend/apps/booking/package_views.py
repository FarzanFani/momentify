from apps.accounts.permissions import IsCustomer, IsProvider
from django.db.models import Prefetch
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import PackageBooking, PackageBookingItem
from .package_serializers import (
    PackageBookingCancelSerializer,
    PackageBookingCreateSerializer,
    PackageBookingScheduleSerializer,
    PackageBookingSerializer,
    PackageBookingStatusSerializer,
)


def package_booking_queryset():
    return PackageBooking.objects.select_related(
        "package", "company", "customer"
    ).prefetch_related(
        Prefetch(
            "items",
            queryset=PackageBookingItem.objects.select_related(
                "service", "service__category", "booking"
            ),
        )
    )


class CustomerPackageBookingViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Customers book, schedule and cancel packages; they cannot edit them."""

    permission_classes = [IsAuthenticated, IsCustomer]
    serializer_class = PackageBookingSerializer

    def get_queryset(self):
        return package_booking_queryset().filter(customer=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = PackageBookingCreateSerializer(
            data=request.data, context=self.get_serializer_context()
        )
        serializer.is_valid(raise_exception=True)
        package_booking = serializer.save()
        return Response(
            PackageBookingSerializer(
                self.get_queryset().get(pk=package_booking.pk),
                context=self.get_serializer_context(),
            ).data,
            status=201,
        )

    @action(detail=True, methods=["post"])
    def schedule(self, request, *args, **kwargs):
        package_booking = self.get_object()
        serializer = PackageBookingScheduleSerializer(
            data=request.data, context={"package_booking": package_booking}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            PackageBookingSerializer(
                self.get_queryset().get(pk=package_booking.pk),
                context=self.get_serializer_context(),
            ).data
        )

    @action(detail=True, methods=["patch"])
    def cancel(self, request, *args, **kwargs):
        package_booking = self.get_object()
        serializer = PackageBookingCancelSerializer(
            package_booking, data=request.data
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            PackageBookingSerializer(
                self.get_queryset().get(pk=package_booking.pk),
                context=self.get_serializer_context(),
            ).data
        )


class ProviderPackageBookingViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Providers see package bookings and confirm or reject them as a whole."""

    permission_classes = [IsAuthenticated, IsProvider]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        queryset = package_booking_queryset().filter(
            company__owner=self.request.user
        )
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    def get_serializer_class(self):
        if self.action == "partial_update":
            return PackageBookingStatusSerializer
        return PackageBookingSerializer

    def partial_update(self, request, *args, **kwargs):
        package_booking = self.get_object()
        serializer = PackageBookingStatusSerializer(
            package_booking, data=request.data
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            PackageBookingSerializer(
                self.get_queryset().get(pk=package_booking.pk),
                context=self.get_serializer_context(),
            ).data
        )
