from django.urls import path

from .views import (
    CreateReviewReplyView,
    CreateReviewView,
    ReviewDestroyView,
    ServiceReviewListView,
)

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
    path(
        "review/<uuid:review_id>/reply/",
        CreateReviewReplyView.as_view(),
        name="review-reply",
    ),
    path(
        "review/<uuid:review_id>/", ReviewDestroyView.as_view(), name="review-deleted"
    ),
    path(
        "review/<uuid:review_id>/reply/",
        CreateReviewReplyView.as_view(),
        name="review-reply",
    ),
]
