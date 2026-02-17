from rest_framework import serializers
from .models import User


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, error_messages={
        "min_length": "Password must be at least 8 characters long"
    })

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password", "role", "phone_number"]

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            role=validated_data.get("role", User.Role.CUSTOMER),
            phone_number=validated_data.get("phone_number"),
        )
