from rest_framework import viewsets
from .models import Company
from .serializers import CompanySerializer
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsProvider
from rest_framework.decorators import permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
@permission_classes([IsAuthenticated, IsProvider])
class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer

    search_fields = ["name", "email", "phone_number"]

    def get_queryset(self):
        return Company.objects.filter(owner=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
