from django.urls import path

from . import views

urlpatterns = [
    path("auth/config/", views.AuthConfigView.as_view(), name="auth-config"),
    path("auth/signup/", views.SignupView.as_view(), name="signup"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/google/", views.GoogleLoginView.as_view(), name="login-google"),
    path("auth/apple/", views.AppleLoginView.as_view(), name="login-apple"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("auth/verify-email/", views.VerifyEmailView.as_view(), name="verify-email"),
    path("auth/resend-verification/", views.ResendVerificationView.as_view(), name="resend-verification"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
]
