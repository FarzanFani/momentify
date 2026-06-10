from django.urls import path

from .views import CreateReviewView, ReviewDestroyView, ServiceReviewListView

urlpatterns = [
    path(
        "bookings/<uuid:booking_id>/review/",
        CreateReviewView.as_view(),
        name="create-booking-review",
    ),
    path(
        "services/<uuid:service_id>/reviews/",
        ServiceReviewListView.as_view(),
        name="service-reviews",
    ),
    path(
        "review/<uuid:review_id>/", ReviewDestroyView.as_view(), name="review-deleted"
    ),
]
