from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CompanyCancellationPolicyRuleViewSet,
    CompanyLocationViewSet,
    CompanyTimeOffViewSet,
    CompanyViewSet,
    CompanyWorkingHoursViewSet,
)

router = DefaultRouter()
router.register(r"companies", CompanyViewSet, basename="company")

company_location_list = CompanyLocationViewSet.as_view(
    {
        "get": "list",
        "post": "create",
    }
)

company_location_detail = CompanyLocationViewSet.as_view(
    {
        "get": "retrieve",
        "put": "update",
        "patch": "partial_update",
        "delete": "destroy",
    }
)

company_working_hours_list = CompanyWorkingHoursViewSet.as_view(
    {"get": "list", "post": "create"}
)

company_working_hours_detail = CompanyWorkingHoursViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)

company_cancellation_policy_rules_list = CompanyCancellationPolicyRuleViewSet.as_view(
    {"get": "list", "post": "create"}
)

company_cancellation_policy_rules_detail = CompanyCancellationPolicyRuleViewSet.as_view(
    {
        "get": "retrieve",
        "put": "update",
        "patch": "partial_update",
        "delete": "destroy",
    }
)

company_time_off_list = CompanyTimeOffViewSet.as_view({"get": "list", "post": "create"})

company_time_off_detail = CompanyTimeOffViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)


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
    path(
        "companies/<uuid:company_id>/working-hours/",
        company_working_hours_list,
        name="company-working-hours-list",
    ),
    path(
        "companies/<uuid:company_id>/working-hours/<uuid:pk>/",
        company_working_hours_detail,
        name="company-working-hours-detail",
    ),
    path(
        "companies/<uuid:company_id>/cancellation-policy/",
        company_cancellation_policy_rules_list,
        name="company-cancellation-policy-list",
    ),
    path(
        "companies/<uuid:company_id>/cancellation-policy/<uuid:pk>/",
        company_cancellation_policy_rules_detail,
        name="company-cancellation-policy-detail",
    ),
    path(
        "companies/<uuid:company_id>/time-off/",
        company_time_off_list,
        name="company-time-offs-list",
    ),
    path(
        "companies/<uuid:company_id>/time-off/<uuid:pk>/",
        company_time_off_detail,
        name="company-time-offs-detail",
    ),
]
