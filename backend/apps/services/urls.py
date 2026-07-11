from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ProviderServiceViewSet,
    PublicServiceViewSet,
    ServiceCategoryTinyListViewSet,
    ServiceCategoryViewSet,
    ServiceViewSet,
)

router = DefaultRouter()
router.register(
    r"companies/(?P<company_id>[^/.]+)/services", ServiceViewSet, basename="services"
)

router.register(r"public/services", PublicServiceViewSet, basename="public-service")

router.register(
    r"provider/services", ProviderServiceViewSet, basename="provider-service"
)


service_category_list = ServiceCategoryViewSet.as_view(
    {"get": "list", "post": "create"}
)

service_category_detail = ServiceCategoryViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)

service_category_tiny_list = ServiceCategoryTinyListViewSet.as_view({"get": "list"})

urlpatterns = [
    path("services/categories/", service_category_list, name="services-category-list"),
    path(
        "services/categories/<int:pk>/",
        service_category_detail,
        name="services-category-detail",
    ),
    path(
        "services/categories/tiny-list/",
        service_category_tiny_list,
        name="services-category-tiny-list",
    ),
    path("", include(router.urls)),
]
