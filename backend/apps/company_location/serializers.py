from rest_framework import serializers
from .models import CompanyLocation


class CompanyLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyLocation
        fields = "__all__"
        read_only_fields = ["id"]