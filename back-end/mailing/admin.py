"""
Admin page "Support emails": write an email, pick who gets it, send a test to yourself, then send it.

    Save and send a test to me      saves the draft and emails only you (subject starts with [TEST])
    Save and send to all recipients saves and sends to everyone in "Recipients" (asks to confirm first)
Once sent, an email can't be changed or sent again — copy its text into a new one instead.
On the Users page, select users → action "Write an email to the selected users" opens a new email for them.
"""

from django.contrib import admin, messages
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.html import format_html, format_html_join

from config.admin_site import AdminOnlyModelAdmin, admin_site

from .models import SupportEmail
from .sending import send_test, start_sending

PREVIEW_LIMIT = 30  # names shown in "Recipients"


@admin.register(SupportEmail, site=admin_site)
class SupportEmailAdmin(AdminOnlyModelAdmin):
    change_form_template = "admin/mailing/supportemail/change_form.html"
    list_display = ("subject", "audience", "status", "sent_count", "failed_count", "sent_at", "created_by")
    list_filter = ("status", "audience")
    search_fields = ("subject", "message")
    autocomplete_fields = ("recipients", "position")
    fieldsets = (
        ("Email", {"fields": ("subject", "message")}),
        ("Send to", {"fields": ("audience", "recipients", "position", "recipient_preview")}),
        (
            "Status",
            {"fields": ("status", "sent_at", "sent_count", "failed_count", "failed_addresses", "created_by", "created_at")},
        ),
    )
    readonly_fields = (
        "recipient_preview",
        "status",
        "sent_at",
        "sent_count",
        "failed_count",
        "failed_addresses",
        "created_by",
        "created_at",
    )

    @admin.display(description="Who will get it")
    def recipient_preview(self, obj):
        if not obj or not obj.pk:
            return "Save the email (or send a test) to see who will get it."
        users = obj.recipient_users()
        count = users.count()
        if count == 0:
            return "Nobody yet — check “Send to”."
        names = format_html_join(", ", "{}", ((u.email,) for u in users[:PREVIEW_LIMIT]))
        more = f" … and {count - PREVIEW_LIMIT} more" if count > PREVIEW_LIMIT else ""
        return format_html("<strong>{} people:</strong> {}{}", count, names, more)

    def get_fieldsets(self, request, obj=None):
        if obj is None:  # new email: no status yet
            return self.fieldsets[:2]
        return self.fieldsets

    def get_readonly_fields(self, request, obj=None):
        if obj and obj.status != SupportEmail.Status.DRAFT:  # sent: everything read-only
            return ("subject", "message", "audience", "recipients", "position", *self.readonly_fields)
        return self.readonly_fields

    def save_model(self, request, obj, form, change):
        if not obj.created_by_id:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def render_change_form(self, request, context, add=False, change=False, form_url="", obj=None):
        context["is_draft"] = obj is None or obj.status == SupportEmail.Status.DRAFT
        context["recipient_count"] = obj.recipient_users().count() if obj and obj.pk else None
        return super().render_change_form(request, context, add, change, form_url, obj)

    def _after_save(self, request, obj):
        """Runs the "send test" / "send to all" buttons. Returns True when it handled one."""
        if "_send_test" in request.POST:
            try:
                send_test(obj, request.user)
                self.message_user(request, f"Test sent to {request.user.email}. Check your inbox.", messages.SUCCESS)
            except Exception as error:
                self.message_user(request, f"The test could not be sent: {error}", messages.ERROR)
            return True
        if "_send_all" in request.POST:
            if obj.status != SupportEmail.Status.DRAFT:
                self.message_user(request, "This email was already sent.", messages.WARNING)
            elif obj.recipient_users().count() == 0:
                self.message_user(request, "Nobody to send to — check “Send to”. Saved as a draft.", messages.WARNING)
            else:
                count = start_sending(obj)
                self.message_user(
                    request,
                    f"Sending to {count} people. Refresh this page in a minute to see the result.",
                    messages.SUCCESS,
                )
            return True
        return False

    def response_add(self, request, obj, post_url_continue=None):
        if self._after_save(request, obj):
            return self._redirect_to(obj)
        return super().response_add(request, obj, post_url_continue)

    def response_change(self, request, obj):
        if self._after_save(request, obj):
            return self._redirect_to(obj)
        return super().response_change(request, obj)

    def _redirect_to(self, obj):
        return HttpResponseRedirect(reverse("admin:mailing_supportemail_change", args=[obj.pk]))
