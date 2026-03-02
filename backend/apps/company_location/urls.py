from rest_framework.routers import DefaultRouter
from .views import CompanyLocationViewSet

router = DefaultRouter()
router.register(r"company-locations", CompanyLocationViewSet, basename="company-location")

urlpatterns = router.urls