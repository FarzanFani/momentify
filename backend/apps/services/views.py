import uuid
from decimal import Decimal, InvalidOperation

from apps.accounts.permissions import IsAdmin, IsProvider
from apps.companies.models import Company
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Service, ServiceCategory
from .serializers import ServiceCategorySerializer, ServiceSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsProvider]

    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = ["name", "category__name"]
    ordering = ["-created_at"]

    def get_company(self):
        return get_object_or_404(
            Company, id=self.kwargs["company_id"], owner=self.request.user
        )

    def get_queryset(self):
        company = self.get_company()
        return Service.objects.select_related("company", "category").filter(
            company=company
        )

    def perform_create(self, serializer):
        company = self.get_company()
        serializer.save(company=company)


class ProviderServiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsProvider]

    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "company__id", "category__id"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Service.objects.select_related("company", "category").filter(
            company__owner=self.request.user
        )

        company_id = self.request.query_params.get("company_id")
        if company_id:
            companies_ids = company_id.split(",")
            for id in companies_ids:
                try:
                    uuid.UUID(id)
                except ValueError:
                    raise ValidationError({"company_id": "Enter a valid company UUID."})

                queryset = queryset.filter(company_id__in=companies_ids)

        category_id = self.request.query_params.get("category_id")
        if category_id:
            category_ids = category_id.split(",")
            for id in category_ids:
                try:
                    pass
                except:
                    raise ValidationError({"category": "Enter a valid category id"})

                queryset = queryset.filter(category_id__in=category_ids)

        return queryset


class PublicServiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]

    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "category__id", "company__id"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Service.objects.select_related("company", "category").filter(
            is_active=True
        )

        company_id = self.request.query_params.get("company_id")
        if company_id:
            try:
                uuid.UUID(company_id)
            except ValueError:
                raise ValidationError({"company_id": "Enter a valid company UUID."})
            queryset = queryset.filter(company_id=company_id)

        category_id = self.request.query_params.get("category_id")
        if category_id:
            category_ids = category_id.split(",")
            try:
                [int(id) for id in category_ids]
            except ValueError:
                raise ValidationError({"category_id": "Enter a valid category id."})
            queryset = queryset.filter(category_id__in=category_ids)

        max_capacity = self.request.query_params.get("max_capacity")
        if max_capacity:
            try:
                max_capacity_value = int(max_capacity)
            except ValueError:
                raise ValidationError({"max_capacity": "Enter a valid capacity."})
            queryset = queryset.filter(max_capacity__gte=max_capacity_value)

        min_price = self.request.query_params.get("min_price")
        if min_price:
            try:
                min_price_value = Decimal(min_price)
            except InvalidOperation:
                raise ValidationError({"min_price": "Enter a valid price."})
            queryset = queryset.filter(price__gte=min_price_value)

        max_price = self.request.query_params.get("max_price")
        if max_price:
            try:
                max_price_value = Decimal(max_price)
            except InvalidOperation:
                raise ValidationError({"max_price": "Enter a valid price."})
            queryset = queryset.filter(price__lte=max_price_value)

        return queryset


class ServiceCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceCategorySerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        if self.action in ["list", "retrieve"]:
            return ServiceCategory.objects.filter(is_active=True)
        return ServiceCategory.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]


class ServiceCategoryTinyListViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        categories = ServiceCategory.objects.filter(is_active=True).order_by("name")
        serializer = ServiceCategorySerializer(categories, many=True)
        return Response(serializer.data)
