from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BookingViewSet, ProviderBookingViewSet

router = DefaultRouter()
router.register(r"customer/bookings", BookingViewSet, basename="booking")
router.register(
    r"provider/bookings", ProviderBookingViewSet, basename="provider-booking"
)

urlpatterns = [
    path("", include(router.urls)),
]
