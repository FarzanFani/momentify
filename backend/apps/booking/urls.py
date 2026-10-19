from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .package_views import (
    CustomerPackageBookingViewSet,
    ProviderPackageBookingViewSet,
)
from .views import BookingViewSet, ProviderBookingViewSet

router = DefaultRouter()
router.register(r"customer/bookings", BookingViewSet, basename="booking")
router.register(
    r"provider/bookings", ProviderBookingViewSet, basename="provider-booking"
)
router.register(
    r"customer/package-bookings",
    CustomerPackageBookingViewSet,
    basename="customer-package-booking",
)
router.register(
    r"provider/package-bookings",
    ProviderPackageBookingViewSet,
    basename="provider-package-booking",
)

urlpatterns = [
    path("", include(router.urls)),
]
