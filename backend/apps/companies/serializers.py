from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["name",
                "description",
                "email",
                "phone_number",
                "logo",
                "verification_status",
                "timezone",
                "auto_approve_booking",
                "cancellation_policy_text"]

        read_only_fields = ["id","created_at", "updated_at"]

        