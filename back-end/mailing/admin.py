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

from .formatting import render_message
from .models import SupportEmail
from .sending import send_test, start_sending

# shown above the message box
FORMAT_HELP = """
<b>Simple formatting</b> (plain text works too):
<code>**bold**</code> · <code>*italic*</code> · <code>[link text](https://…)</code> ·
<code>- bullet</code> · <code>1. numbered</code> · <code>## Heading</code> ·
button: <code>[button: Open your workspace](https://engivexlab.com/portal)</code> (on its own line) ·
<code>{name}</code> = first name.<br>
<b>HTML</b>: write the HTML yourself, with inline styles (<code>style="…"</code>); email apps ignore &lt;style&gt;.
Nothing is added after your message (no sign-off, no footer), so end it the way you like.<br>
Save to see a preview below, or use “Save and send a test to me”.
"""

PREVIEW_LIMIT = 30  # names shown in "Recipients"


@admin.register(SupportEmail, site=admin_site)
class SupportEmailAdmin(AdminOnlyModelAdmin):
    change_form_template = "admin/mailing/supportemail/change_form.html"
    list_display = ("subject", "audience", "status", "sent_count", "failed_count", "sent_at", "created_by")
    list_filter = ("status", "audience")
    search_fields = ("subject", "message")
    autocomplete_fields = ("recipients", "position")
    fieldsets = (
        ("Email", {"fields": ("subject", "format", "message", "message_preview"), "description": FORMAT_HELP}),
        ("Send to", {"fields": ("audience", "recipients", "position", "recipient_preview")}),
        (
            "Status",
            {"fields": ("status", "sent_at", "sent_count", "failed_count", "failed_addresses", "created_by", "created_at")},
        ),
    )
    readonly_fields = (
        "message_preview",
        "recipient_preview",
        "status",
        "sent_at",
        "sent_count",
        "failed_count",
        "failed_addresses",
        "created_by",
        "created_at",
    )

    @admin.display(description="Preview")
    def message_preview(self, obj):
        if not obj or not obj.pk or not obj.message:
            return "Save the email to see how the message will look."
        markup, _ = render_message(obj.message, obj.format, "Ann")
        # shown in a frame, so the admin page's own styles don't change how it looks
        page = (
            '<body style="margin:0;padding:20px 24px;background:#fff;'
            f'font:15px/1.65 Arial,Helvetica,sans-serif;color:#334155">{markup}</body>'
        )
        return format_html(
            '<iframe srcdoc="{}" title="Preview" sandbox="allow-same-origin" '
            'style="width:600px;max-width:100%;min-height:120px;border:1px solid #e6e3f3;border-radius:12px;background:#fff" '
            "onload=\"this.style.height=(this.contentDocument.body.scrollHeight+4)+'px'\"></iframe>"
            '<div style="margin-top:6px;color:#8a8fa3;font-size:12px">{{name}} shown as “Ann”.</div>',
            page,
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
        if obj is None:  # new email: no preview or status yet
            email, send_to = self.fieldsets[0], self.fieldsets[1]
            fields = tuple(f for f in email[1]["fields"] if f != "message_preview")
            return ((email[0], {**email[1], "fields": fields}), send_to)
        return self.fieldsets

    def get_readonly_fields(self, request, obj=None):
        if obj and obj.status != SupportEmail.Status.DRAFT:  # sent: everything read-only
            return ("subject", "format", "message", "audience", "recipients", "position", *self.readonly_fields)
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
