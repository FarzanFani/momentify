from rest_framework import serializers
from .models import Company, CompanyLocation

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "owner",
            "name",
            "description",
            "logo",
            "email",
            "phone_number",
            "auto_approve_booking",
            "cancellation_policy_text",
            "verification_status",
            "timezone",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "verification_status",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["owner"] = request.user
        return super().create(validated_data)

class CompanyLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyLocation
        fields = [
            "id",
            "company",
            "name",
            "address",
            "city",
            "country",
            "latitude",
            "longitude",
        ]
        read_only_fields = ["id", "company"]