from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsProvider
from .serializers import CompanyLocationSerializer
from .models import CompanyLocation


class CompanyLocationViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyLocationSerializer
    permission_classes = [IsAuthenticated, IsProvider]

    def get_queryset(self):
        queryset = CompanyLocation.objects.filter(company__owner=self.request.user)
        company_id = self.request.query_params.get("company")
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        return queryset.order_by("-id")

    def perform_create(self, serializer):
        company = serializer.validated_data["company"]
        if company.owner != self.request.user:
            raise PermissionDenied("You are not allowed to create a company location for this company")
        serializer.save()

    def perform_update(self, serializer):
        location = self.get_object()
        if location.company.owner != self.request.user:
            raise PermissionDenied("You are not allowed to update this company location")

        if "company" in serializer.validated_data:
            if serializer.validated_data["company"].id != location.company_id:
                raise PermissionDenied("You are not allowed to change the company for this location")
        
        serializer.save()

