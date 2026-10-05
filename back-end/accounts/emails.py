"""
Email verification for sign-up.

    send_verification_email(user)   email with a link: <FRONTEND_URL>/verify-email?uid=...&token=...
    user_from_link(uid, token)      the user that link belongs to, or None (wrong / expired / used)

The link works once and expires after settings.PASSWORD_RESET_TIMEOUT (Django default: 3 days).
How emails are sent (console in development, SMTP for real inboxes) is set in .env — see settings.py.
Email text: templates/emails/verify_email.txt and .html (layout with the logo: emails/base.html).
"""

import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from config.mail import attach_logo, email_context


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """Signed, time-limited token. It stops working once the email is verified (or the email changes)."""

    key_salt = "accounts.emails.EmailVerificationTokenGenerator"

    def _make_hash_value(self, user, timestamp):
        return f"{user.pk}{timestamp}{user.email_verified}{user.email}"


token_generator = EmailVerificationTokenGenerator()


def verification_link(user) -> str:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = token_generator.make_token(user)
    return f"{settings.FRONTEND_URL.rstrip('/')}/verify-email?uid={uid}&token={token}"


logger = logging.getLogger(__name__)


def send_verification_email(user) -> bool:
    """Send the link. Returns False (and logs why) if the mail server can't be reached."""
    try:
        _send(user)
        return True
    except Exception:  # SMTP down, blocked port, wrong password... the account itself is fine
        logger.exception("Could not send the verification email to %s", user.email)
        return False


def _send(user) -> None:
    context = {
        **email_context(),  # logo, site name and address (config/mail.py)
        "name": user.first_name or user.email,
        "link": verification_link(user),
        "days": round(settings.PASSWORD_RESET_TIMEOUT / 86400),
    }
    message = EmailMultiAlternatives(
        subject=f"Verify your email for {settings.SITE_NAME}",
        body=render_to_string("emails/verify_email.txt", context),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    message.attach_alternative(render_to_string("emails/verify_email.html", context), "text/html")
    attach_logo(message)
    message.send()


def user_from_link(uid: str, token: str):
    User = get_user_model()
    try:
        user = User.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return None
    return user if token_generator.check_token(user, token) else None
