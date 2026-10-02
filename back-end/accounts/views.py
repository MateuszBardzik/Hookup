"""
API endpoints for accounts.

    GET   /api/auth/config/   public   -> which social logins are enabled
    POST  /api/auth/signup/   public   -> create account + send verification email, returns {email}
    POST  /api/auth/login/    public   -> email + password, returns {token, user}
                                          (403 with code "email_not_verified" until the email is verified)
    POST  /api/auth/verify-email/         public -> {uid, token} from the email link; verifies + logs in
    POST  /api/auth/resend-verification/  public -> {email}; sends a new link (max 5 per hour)
    POST  /api/auth/google/   public   -> Google ID token, returns {token, user}
    POST  /api/auth/apple/    public   -> Apple ID token, returns {token, user}
    POST  /api/auth/logout/   logged in
    GET   /api/profile/       logged in -> current user's profile
    PATCH /api/profile/       logged in -> update profile (JSON or multipart for photo)
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .emails import send_verification_email, user_from_link

from .serializers import (
    AppleLoginSerializer,
    GoogleLoginSerializer,
    LoginSerializer,
    SignupSerializer,
    UserSerializer,
)
from .social import SocialAuthError, verify_apple_token, verify_google_token

User = get_user_model()


def auth_response(user, status_code=status.HTTP_200_OK):
    """Same response shape for every way of logging in."""
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": UserSerializer(user).data}, status=status_code)


def get_or_create_social_user(email, first_name="", last_name=""):
    # Google / Apple already confirmed this email address, so the account counts as verified.
    user, created = User.objects.get_or_create(
        email=email.lower(),
        defaults={"first_name": first_name, "last_name": last_name, "email_verified": True},
    )
    if created:
        user.set_unusable_password()
        user.save()
    elif not user.email_verified:
        user.email_verified = True
        user.save(update_fields=["email_verified"])
    return user


class AuthConfigView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response(
            {
                "google_client_id": settings.GOOGLE_CLIENT_ID,
                "apple_client_id": settings.APPLE_CLIENT_ID,
                "apple_redirect_uri": settings.APPLE_REDIRECT_URI,
            }
        )


class SignupView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        sent = send_verification_email(user)
        # No login yet: the user must click the link in the email first.
        # If the email couldn't be sent, the account still exists; "Resend" can try again later.
        return Response({"email": user.email, "verification_sent": sent}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        if not user.email_verified:
            return Response(
                {
                    "detail": "Email verification required. Please click the link we sent to your email.",
                    "code": "email_not_verified",
                    "email": user.email,
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return auth_response(user)


class VerifyEmailView(APIView):
    """The verification page sends the uid + token from the email link. Success = verified and logged in."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        user = user_from_link(str(request.data.get("uid", "")), str(request.data.get("token", "")))
        if user is None:
            return Response(
                {"detail": "This verification link is invalid or has expired.", "code": "invalid_link"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.email_verified = True
        user.save(update_fields=["email_verified"])
        return auth_response(user)


class ResendVerificationView(APIView):
    """Send a new link. Always answers the same, so it doesn't reveal which emails have accounts."""

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "verification_email"

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        user = User.objects.filter(email=email, email_verified=False, is_active=True).first()
        if user and not send_verification_email(user):
            return Response(
                {"detail": "We couldn't send the email right now. Please try again later.", "code": "email_failed"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"sent": True})


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            info = verify_google_token(serializer.validated_data["credential"])
        except SocialAuthError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return auth_response(get_or_create_social_user(**info))


class AppleLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = AppleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            info = verify_apple_token(data["id_token"])
        except SocialAuthError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        user = get_or_create_social_user(info["email"], data["first_name"], data["last_name"])
        return auth_response(user)


class LogoutView(APIView):
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileView(APIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
