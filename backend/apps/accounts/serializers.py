from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    has_company_registered = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone_number",
            "is_verified",
            "date_joined",
            "has_company_registered",
        ]
        read_only_fields = fields

    def get_has_company_registered(self, user):
        if user.role != user.Role.PROVIDER:
            return False
        return user.owned_companies.exists()


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


class UserAddSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "role", "phone_number"]
        extra_kwargs = {
            "email": {"required": True},
            "role": {"required": True},
            "phone_number": {"required": True},
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            role=validated_data.get("role", User.Role.CUSTOMER),
            phone_number=validated_data.get("phone_number"),
        )

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role", "phone_number", "is_verified", "is_active"]
        read_only_fields = fields

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["is_verified", "is_active"]
