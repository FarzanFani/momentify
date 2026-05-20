from rest_framework import serializers

from .models import (
    Company,
    CompanyCancellationPolicyRules,
    CompanyLocation,
    CompanyTimeOff,
    CompanyWorkingHours,
)


class CompanySerializer(serializers.ModelSerializer):
    has_location = serializers.SerializerMethodField()
    has_cancelation_policy = serializers.SerializerMethodField()
    has_working_hours = serializers.SerializerMethodField()
    is_profile_complete = serializers.SerializerMethodField()

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
            "has_location",
            "has_cancelation_policy",
            "has_working_hours",
            "is_profile_complete",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "verification_status",
            "has_cancelation_policy",
            "has_working_hours",
            "has_location",
            "is_profile_complete",
            "created_at",
            "updated_at",
        ]

    def get_has_location(self, obj):
        return getattr(obj, "has_location_value", obj.location.exists())

    def get_has_cancelation_policy(self, obj):
        return getattr(obj, "has_cancelation_policy", obj.location.exists())

    def get_has_working_hours(self, obj):
        return getattr(obj, "has_working_hours", obj.location.exists())

    def get_is_profile_complete(self, obj):
        return (
            self.get_has_cancelation_policy(obj)
            and self.get_has_location(obj)
            and self.get_has_working_hours(obj)
        )

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


class CompanyWorkingHoursSerializer(serializers.ModelSerializer):
    weekday = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=6),
        write_only=True,
        allow_empty=False,
    )

    class Meta:
        model = CompanyWorkingHours
        fields = ["id", "company", "weekday", "start_time", "end_time"]
        read_only_fields = ["id", "company"]

    def validate_weekday(self, value):
        unique_weekdays = list(dict.fromkeys(value))

        if len(unique_weekdays) != len(value):
            raise serializers.ValidationError("Duplicate weekdays are not allowed.")
        return unique_weekdays

    def validate(self, attrs):
        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError(
                {"end_time": "End time must be after start time"}
            )

        return attrs

    def create(self, validated_data):
        weekdays = validated_data.pop("weekday")

        working_hours = []

        for weekday in weekdays:
            obj, created = CompanyWorkingHours.objects.get_or_create(
                weekday=weekday, **validated_data
            )
            working_hours.append(obj)

        return working_hours

    def to_representation(self, instance):
        if isinstance(instance, list):
            if not instance:
                return {
                    "company": None,
                    "weekday": [],
                    "weekday_display": [],
                    "start_time": None,
                    "end_time": None,
                }

            return {
                "company": instance[0].company_id,
                "weekday": [item.weekday for item in instance],
                "weekday_display": [item.get_weekday_display() for item in instance],
                "start_time": instance[0].start_time,
                "end_time": instance[0].end_time,
            }

        return CompanyWorkingHoursReadSerializer(instance).data


class CompanyWorkingHoursGroupedSerializer(serializers.Serializer):
    weekday = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=6)
    )
    weekday_display = serializers.ListField(child=serializers.CharField())
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()


class CompanyWorkingHoursReadSerializer(serializers.ModelSerializer):
    weekday_display = serializers.CharField(
        source="get_weekday_display",
        read_only=True,
    )

    class Meta:
        model = CompanyWorkingHours
        fields = [
            "id",
            "company",
            "weekday",
            "weekday_display",
            "start_time",
            "end_time",
        ]
        read_only_fields = fields


class CompanyTimeOffSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyTimeOff
        fields = ["id", "company", "start_datetime", "end_datetime", "reason"]
        read_only_fields = ["id", "company"]

    def validate(self, attrs):
        start_datetime = attrs.get("start_datetime")
        end_datetime = attrs.get("end_datetime")

        if start_datetime and end_datetime and start_datetime >= end_datetime:
            raise serializers.ValidationError(
                {"end_datetime": "End datetime must be after start datetime."}
            )

        return attrs


class CompanyCancellationPolicySerilizer(serializers.ModelSerializer):
    class Meta:
        model = CompanyCancellationPolicyRules
        fields = [
            "id",
            "company",
            "rule_description",
            "hours_before_event",
            "refund_precentage",
            "priority",
            "is_active",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "company",
            "created_at",
        ]

    def validate_refund_percentage(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Refund percentage must be between 0 and 100"
            )
        return value
