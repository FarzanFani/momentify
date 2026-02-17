from rest_framework import viewsets
from .models import Company
from .serializers import CompanySerializer
from rest_framework.permissions import IsAuthenticated

class CompanyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Company.objects.all().order_by("-created_at")
    serializer_class = CompanySerializer