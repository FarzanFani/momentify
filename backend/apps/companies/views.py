from apps.accounts.permissions import IsProvider
from django.core.serializers import serialize
from django.db.models import Exists, OuterRef
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Company,
    CompanyCancellationPolicyRules,
    CompanyLocation,
    CompanyTimeOff,
    CompanyWorkingHours,
)
from .serializers import (
    CompanyCancellationPolicySerilizer,
    CompanyLocationSerializer,
    CompanyPreviewSerializer,
    CompanySerializer,
    CompanyTimeOffSerializer,
    CompanyWorkingHoursGroupedSerializer,
    CompanyWorkingHoursSerializer,
)


class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsProvider]

    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = ["name", "email", "phone_number"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Company.objects.filter(owner=self.request.user).annotate(
            has_location_value=Exists(
                CompanyLocation.objects.filter(company=OuterRef("pk"))
            ),
            has_cancellation_policy_value=Exists(
                CompanyCancellationPolicyRules.objects.filter(company=OuterRef("pk"))
            ),
            has_working_hours_value=Exists(
                CompanyWorkingHours.objects.filter(company=OuterRef("pk"))
            ),
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["get"], url_path="preview")
    def preview(self, request, pk=None):
        company = get_object_or_404(Company, pk=pk, owner=request.user)
        serializer = CompanyPreviewSerializer(
            company,
            context=self.get_serializer_context(),
        )
        return Response(serializer.data)


class CompanyLocationViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyLocationSerializer
    permission_classes = [IsAuthenticated, IsProvider]

    ordering = ["name"]

    def get_company(self):
        return get_object_or_404(
            Company, id=self.kwargs["company_id"], owner=self.request.user
        )

    def get_queryset(self):
        company = self.get_company()
        return CompanyLocation.objects.filter(company=company)

    def perform_create(self, serializer):
        company = self.get_company()
        serializer.save(company=company)


class CompanyWorkingHoursViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyWorkingHoursSerializer
    permission_classes = [IsAuthenticated, IsProvider]

    filter_backends = [OrderingFilter]

    def get_company(self):
        return get_object_or_404(
            Company, id=self.kwargs["company_id"], owner=self.request.user
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        grouped = {}

        for item in queryset:
            key = (item.start_time, item.end_time)

            if key not in grouped:
                grouped[key] = {
                    "weekday": [],
                    "weekday_display": [],
                    "start_time": item.start_time,
                    "end_time": item.end_time,
                }

            grouped[key]["weekday"].append(item.weekday)
            grouped[key]["weekday_display"].append(item.get_weekday_display())

        serializer = CompanyWorkingHoursGroupedSerializer(
            list(grouped.values()),
            many=True,
        )

        return Response(serializer.data)

    def get_queryset(self):
        company = self.get_company()
        return CompanyWorkingHours.objects.filter(company=company)

    def perform_create(self, serializer):
        company = self.get_company()
        serializer.save(company=company)


class CompanyCancellationPolicyRuleViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyCancellationPolicySerilizer
    permission_classes = [IsAuthenticated, IsProvider]

    filter_backends = [OrderingFilter]
    ordering = [
        "priority",
        "hours_before_event",
    ]

    def get_company(self):
        return get_object_or_404(
            Company, id=self.kwargs["company_id"], owner=self.request.user
        )

    def get_queryset(self):
        company = self.get_company()
        return CompanyCancellationPolicyRules.objects.filter(company=company)

    def perform_create(self, serializer):
        company = self.get_company()
        serializer.save(company=company)


class CompanyTimeOffViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyTimeOffSerializer
    permission_classes = [IsAuthenticated, IsProvider]

    filter_backends = [OrderingFilter]

    def get_company(self):
        return get_object_or_404(
            Company,
            id=self.kwargs["company_id"],
            owner=self.request.user,
        )

    def get_queryset(self):
        company = self.get_company()
        return CompanyTimeOff.objects.filter(company=company)

    def perform_create(self, serializer):
        company = self.get_company()
        serializer.save(company=company)
