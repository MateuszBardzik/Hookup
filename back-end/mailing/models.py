"""
Emails the support team writes on the admin pages (Emails to users → Support emails) and sends to users.

Who receives it is chosen with `audience`:
    selected     only the users picked in `recipients`
    verified     every active user with a verified email
    all          every active user
    applicants   everyone who applied (to `position`, or to any position when it's empty)
Each person gets their own copy (nobody sees the other addresses). In the subject and message,
{name} is replaced by the person's first name. `format`: simple formatting or HTML
(mailing/formatting.py). Sending: mailing/sending.py.
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models


class SupportEmail(models.Model):
    class Audience(models.TextChoices):
        SELECTED = "selected", "Only the users selected below"
        VERIFIED = "verified", "All users with a verified email"
        ALL = "all", "All active users"
        APPLICANTS = "applicants", "Everyone who applied (to the position below, or to any position)"

    class Format(models.TextChoices):
        MARKDOWN = "markdown", "Simple formatting (bold, links, lists, buttons)"
        HTML = "html", "HTML (advanced)"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENDING = "sending", "Sending…"
        SENT = "sent", "Sent"
        PARTLY = "partly", "Sent with errors"

    subject = models.CharField(max_length=200)
    message = models.TextField(
        help_text="An empty line starts a new paragraph. {name} is replaced by the person's first name. "
        "Formatting: see the help above."
    )
    format = models.CharField(max_length=10, choices=Format.choices, default=Format.MARKDOWN)
    audience = models.CharField(max_length=12, choices=Audience.choices, default=Audience.SELECTED)
    recipients = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name="support_emails",
        help_text='Used when "Send to" is "Only the users selected below". Type a name or email to search.',
    )
    position = models.ForeignKey(
        "positions.Position",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text='Used when "Send to" is "Everyone who applied". Empty = applicants of any position.',
    )

    status = models.CharField(max_length=8, choices=Status.choices, default=Status.DRAFT, editable=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+", editable=False
    )
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True, editable=False)
    sent_count = models.PositiveIntegerField(default=0, editable=False)
    failed_count = models.PositiveIntegerField(default=0, editable=False)
    failed_addresses = models.TextField(blank=True, editable=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "support email"

    def __str__(self):
        return self.subject

    def recipient_users(self):
        """The users this email goes to (active accounts only, each once)."""
        users = get_user_model().objects.filter(is_active=True)
        if self.audience == self.Audience.SELECTED:
            users = users.filter(pk__in=self.recipients.values("pk")) if self.pk else users.none()
        elif self.audience == self.Audience.VERIFIED:
            users = users.filter(email_verified=True)
        elif self.audience == self.Audience.APPLICANTS:
            applied = users.filter(applications__isnull=False)
            users = applied.filter(applications__position=self.position) if self.position_id else applied
        return users.distinct().order_by("email")
