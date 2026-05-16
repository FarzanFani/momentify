from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from .models import Company, CompanyLocation
from .serializers import CompanySerializer, CompanyLocationSerializer
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsProvider
from rest_framework.filters import SearchFilter, OrderingFilter
class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsProvider]

    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = ["name", "email", "phone_number"]
    ordering_fields = ["name", "created_at" , "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Company.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class CompanyLocationViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyLocationSerializer
    permission_classes = [IsAuthenticated, IsProvider]

    ordering = ["name"]

    def get_company(self):
        return get_object_or_404(
            Company,
            id=self.kwargs["company_id"],
            owner=self.request.user
        )

    def get_queryset(self):
        company = self.get_company()
        return CompanyLocation.objects.filter(company=company)

    def perform_create(self, serializer):
        company = self.get_company()
        serializer.save(company=company)
        
