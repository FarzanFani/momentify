from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CompanyViewSet, CompanyLocationViewSet


router = DefaultRouter()
router.register(r"companies", CompanyViewSet, basename="company")

company_location_list = CompanyLocationViewSet.as_view({
    "get": "list",
    "post": "create",
})

company_location_detail = CompanyLocationViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy",
})

urlpatterns = [
    path("", include(router.urls)),

    path(
        "companies/<uuid:company_id>/locations/",
        company_location_list,
        name="company-location-list",
    ),

    path(
        "companies/<uuid:company_id>/locations/<uuid:pk>/",
        company_location_detail,
        name="company-location-detail",
    ),
]