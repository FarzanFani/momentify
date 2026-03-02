from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = "__all__"

        read_only_fields = ["created_at", "updated_at", "owner"]

    def create(self, validated_data):
            validated_data["owner"] = self.context["request"].user
            return super().create(validated_data)

    # def to_representation(self, instance):
    #     data = super().to_representation(instance)
    #     data["owner"] = UserSerializer(instance.owner).data
    #     return data