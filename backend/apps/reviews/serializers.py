from rest_framework import serializers

from .models import Review, ReviewReply


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField

    class Meta:
        model = Review
        fields = [
            "id",
            "company",
            "booking",
            "customer",
            "rating",
            "service",
            "comments",
            "is_anonymous",
            "created_at",
            "customer_name",
        ]
        read_only_fields = ["id", "company", "service", "customer", "created_at"]

        def get_customer_name(self, obj):
            if obj.is_anonymous:
                return "Anonymous"
            return obj.customer.first_name + " " + obj.customer.last_name

        def validate_rating(self, value):
            if value < 1 or value > 5:
                raise serializers.ValidationError("Rating must be between 1 and 5.")
            return value


class ReviewReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReply
        fields = ["review", "user", "message", "created_at"]
        read_only_fields = ["user", "created_at"]

    def validate_comments(self, value):
        if not value.strip():
            raise serializers.ValidationError("Comment cannot be empty.")
        return value


class PublicReviewSerializer(serializers.ModelSerializer):
    reply = ReviewReplySerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "company",
            "booking",
            "rating",
            "service",
            "comments",
            "is_anonymous",
            "reply",
            "created_at",
        ]
