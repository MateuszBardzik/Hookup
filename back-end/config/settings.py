"""
Django settings for the engivexlab back-end.

Values that change between machines (secret key, debug flag, Google/Apple
client IDs) are read from the `.env` file next to manage.py.
Copy `.env.example` to `.env` and edit it.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes")


# --------------------------------------------------------------------------- #
# Core
# --------------------------------------------------------------------------- #
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-only-insecure-key-change-me")
DEBUG = env_bool("DJANGO_DEBUG", True)
ALLOWED_HOSTS = [h for h in os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h]
# Full addresses allowed to post forms (admin login), e.g. https://engivexlab.com,https://www.engivexlab.com
CSRF_TRUSTED_ORIGINS = [o for o in os.getenv("DJANGO_CSRF_TRUSTED_ORIGINS", "").split(",") if o]

# Live site behind nginx with HTTPS (DJANGO_HTTPS=true in the server's .env)
if env_bool("DJANGO_HTTPS", False):
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

INSTALLED_APPS = [
    # Django (admin pages at /hookup/, see config/admin_site.py)
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework.authtoken",
    # Local apps
    "accounts",
    "positions",
    "testimonials",
    "faqs",
    "portal",
    "contact",
    "mailing",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],  # templates/admin/ = admin page look
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# --------------------------------------------------------------------------- #
# Database
# --------------------------------------------------------------------------- #
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# --------------------------------------------------------------------------- #
# Users & passwords
# --------------------------------------------------------------------------- #
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --------------------------------------------------------------------------- #
# REST API (Django REST Framework)
# Every request from the front-end sends:  Authorization: Token <key>
# --------------------------------------------------------------------------- #
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    # Limits for the public contact form (see contact/views.py)
    "DEFAULT_THROTTLE_RATES": {"contact": "5/hour", "verification_email": "5/hour"},
}

# --------------------------------------------------------------------------- #
# Social login (leave empty to hide the button on the front-end)
# --------------------------------------------------------------------------- #
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
APPLE_CLIENT_ID = os.getenv("APPLE_CLIENT_ID", "")  # Apple "Services ID"
APPLE_REDIRECT_URI = os.getenv("APPLE_REDIRECT_URI", "")

# The React website: "View site" link in the admin pages and the link in verification emails
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
SITE_NAME = os.getenv("SITE_NAME", "engivexlab")

# Address of the admin pages: https://<site>/hookup/ (if you change it, also change deploy/nginx.conf)
ADMIN_URL = "hookup/"

# ---- Sending email (sign-up verification) ----
# Pick ONE way to send (first one that is filled in wins):
#   1. Mailgun HTTP API  - set MAILGUN_API_KEY + MAILGUN_DOMAIN (HTTPS, works even where SMTP is blocked)
#   2. SMTP server       - set EMAIL_HOST etc. (Gmail, Outlook, Mailgun SMTP...)
#   3. Nothing set       - development: emails are printed in the `runserver` terminal (nothing is sent)
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY", "")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN", "")
# EU-region Mailgun domains use https://api.eu.mailgun.net
MAILGUN_API_URL = os.getenv("MAILGUN_API_URL", "https://api.mailgun.net")
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
if MAILGUN_API_KEY:
    EMAIL_BACKEND = "config.mailgun_backend.MailgunBackend"
elif EMAIL_HOST:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", True)
EMAIL_USE_SSL = env_bool("EMAIL_USE_SSL", False)
EMAIL_TIMEOUT = int(os.getenv("EMAIL_TIMEOUT", "15"))  # seconds to wait for the mail server
_default_sender = (
    f"no-reply@{MAILGUN_DOMAIN}" if MAILGUN_API_KEY and MAILGUN_DOMAIN
    else EMAIL_HOST_USER or "no-reply@localhost"
)
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL") or f"{SITE_NAME} <{_default_sender}>"
# Support emails written on the admin pages (Emails to users): replies go to this address
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", "support@engivexlab.com")
# Public address of the website, shown in email footers (also when emails are sent from a PC)
PUBLIC_SITE_URL = os.getenv("PUBLIC_SITE_URL", "https://engivexlab.com")
# True = send support emails before the page answers (used by the tests); False = in the background
MAILING_SEND_NOW = False
# Verification links expire after this many seconds (3 days)
PASSWORD_RESET_TIMEOUT = 60 * 60 * 24 * 3

# --------------------------------------------------------------------------- #
# Internationalization
# --------------------------------------------------------------------------- #
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# --------------------------------------------------------------------------- #
# Static & uploaded files
# --------------------------------------------------------------------------- #
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"  # `manage.py collectstatic` copies admin CSS/JS here (served by nginx)
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"  # profile photos, position images

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
