"""
Serializers convert between JSON (front-end) and Python/model objects,
and validate incoming data.
"""

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """The current user's profile (read + update). Email cannot be changed here."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "identity",
            "address",
            "phone",
            "linkedin_url",
            "website",
            "photo",
            "email_verified",
        ]
        read_only_fields = ["id", "email", "email_verified"]


class SignupSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, data):
        # Run Django's password rules (length, too common, too similar to name...)
        candidate = User(email=data["email"], first_name=data["first_name"], last_name=data["last_name"])
        validate_password(data["password"], user=candidate)
        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            request=self.context.get("request"),
            email=data["email"].lower(),
            password=data["password"],
        )
        if user is None:
            raise serializers.ValidationError("Incorrect email or password.")
        data["user"] = user
        return data


class GoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField()


class AppleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField()
    first_name = serializers.CharField(required=False, allow_blank=True, default="")
    last_name = serializers.CharField(required=False, allow_blank=True, default="")
