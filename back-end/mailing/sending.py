"""
Sending support emails (mailing/models.py → SupportEmail).

    send_test(email, user)   one copy to `user` (the admin), marked [TEST]; the email stays a draft
    start_sending(email)     sends to every recipient — in the background, so the admin page doesn't
                             wait; the email's status / counters update when it's done

Each recipient gets a personal copy with {name} filled in, the logo layout (templates/emails/
support_email.html + .txt) and Reply-To = settings.SUPPORT_EMAIL.
"""

import logging
import threading

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection
from django.db import close_old_connections
from django.template.loader import render_to_string
from django.utils import timezone

from config.mail import attach_logo, email_context

from .formatting import render_message
from .models import SupportEmail

logger = logging.getLogger(__name__)


def build_message(email: SupportEmail, user, subject_prefix: str = "") -> EmailMultiAlternatives:
    name = user.first_name or "there"
    message_html, message_text = render_message(email.message, email.format, name)
    context = {**email_context(), "message_html": message_html, "message_text": message_text}
    msg = EmailMultiAlternatives(
        subject=subject_prefix + email.subject.replace("{name}", name),
        body=render_to_string("emails/support_email.txt", context),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
        reply_to=[settings.SUPPORT_EMAIL],
    )
    msg.attach_alternative(render_to_string("emails/support_email.html", context), "text/html")
    attach_logo(msg)
    return msg


def send_test(email: SupportEmail, user) -> None:
    """Raises if the mail server refuses, so the admin page can show the reason."""
    build_message(email, user, subject_prefix="[TEST] ").send()


def start_sending(email: SupportEmail) -> int:
    """Mark as sending and send to all recipients. Returns how many people it goes to."""
    count = email.recipient_users().count()
    SupportEmail.objects.filter(pk=email.pk).update(status=SupportEmail.Status.SENDING)
    if settings.MAILING_SEND_NOW:
        _send_all(email.pk)
    else:
        threading.Thread(target=_send_all, args=(email.pk,), daemon=True).start()
    return count


def _send_all(email_id: int) -> None:
    try:
        email = SupportEmail.objects.get(pk=email_id)
        sent, failed = 0, []
        connection = get_connection()
        for user in email.recipient_users().iterator():
            try:
                connection.send_messages([build_message(email, user)])
                sent += 1
            except Exception:  # one bad address must not stop the others
                logger.exception("Support email %s: could not send to %s", email_id, user.email)
                failed.append(user.email)
        SupportEmail.objects.filter(pk=email_id).update(
            status=SupportEmail.Status.PARTLY if failed else SupportEmail.Status.SENT,
            sent_at=timezone.now(),
            sent_count=sent,
            failed_count=len(failed),
            failed_addresses="\n".join(failed),
        )
    finally:
        close_old_connections()
