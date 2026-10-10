"""
Admin page "Support emails": write an email, pick who gets it, send a test to yourself, then send it.

    Save and send a test to me      saves the draft and emails only you (subject starts with [TEST])
    Save and send to all recipients saves and sends to everyone in "Recipients" (asks to confirm first)
Once sent, an email can't be changed or sent again — reuse it instead:
    "Reuse for a new email" (top right of an email, or the list action) opens a new draft with the same
    subject and message. "Skip people who already got it" (on by default) leaves out everyone who received
    the original or an earlier copy, so you can send the same email to people who joined since.
    On a new email, "Start from a previous email" loads an earlier email's text into it.
On the Users page, select users → action "Write an email to the selected users" opens a new email for them.
"""

from django import forms
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
Write the message in <b>HTML</b>, with inline styles (<code>style="…"</code>) — email apps ignore &lt;style&gt;.
<code>{name}</code> = the person's first name.
Nothing is added after your message (no sign-off, no footer), so end it the way you like.<br>
Save to see a preview below, or use “Save and send a test to me”.
"""

# what a new email starts with (edit or replace it)
STARTER_MESSAGE = """<p style="margin:0 0 14px">Hi {name},</p>

<p style="margin:0 0 14px">Write your message here.</p>

<p style="margin:22px 0">
  <a href="https://engivexlab.com/portal" style="display:inline-block;background:#4f35e6;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:10px">Open your workspace</a>
</p>

<p style="margin:0">Best regards,<br>The engivexlab team</p>
"""

PREVIEW_LIMIT = 30  # names shown in "Recipients"
PREVIOUS_LIMIT = 50  # emails listed in "Start from a previous email"


@admin.register(SupportEmail, site=admin_site)
class SupportEmailAdmin(AdminOnlyModelAdmin):
    change_form_template = "admin/mailing/supportemail/change_form.html"
    list_display = ("subject", "audience", "status", "sent_count", "failed_count", "sent_at", "created_by")
    list_filter = ("status", "audience")
    search_fields = ("subject", "message")
    actions = ("reuse",)
    autocomplete_fields = ("recipients", "position")
    fieldsets = (
        ("Email", {"fields": ("copied_from", "reused_from", "subject", "message", "message_preview"), "description": FORMAT_HELP}),
        ("Send to", {"fields": ("audience", "recipients", "position", "skip_already_received", "recipient_preview")}),
        (
            "Status",
            {"fields": ("status", "sent_at", "sent_count", "failed_count", "failed_addresses", "created_by", "created_at")},
        ),
    )
    readonly_fields = (
        "reused_from",
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
        markup, _ = render_message(obj.message, "Ann")
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
        label = "1 person" if count == 1 else f"{count} people"
        return format_html("<strong>{}:</strong> {}{}{}", label, names, more, self._skipped_note(obj))

    def _skipped_note(self, obj):
        if not (obj.copied_from_id and obj.skip_already_received and obj.status == SupportEmail.Status.DRAFT):
            return ""
        skipped = obj.already_received().count()
        who = "1 person who already got it is" if skipped == 1 else f"{skipped} people who already got it are"
        return format_html("<br><span style='color:#8a8fa3'>{} left out.</span>", who)

    @admin.display(description="Reused from")
    def reused_from(self, obj):
        source = obj.copied_from if obj else None
        if not source:
            return "-"
        url = reverse("admin:mailing_supportemail_change", args=[source.pk])
        when = f"sent {source.sent_at:%b %d, %Y}" if source.sent_at else source.get_status_display().lower()
        return format_html('<a href="{}">{}</a> ({})', url, source.subject, when)

    def _source_from(self, request):
        """The email being reused on a new email page (?copy_from=<id>, or the hidden field after a save error)."""
        pk = request.POST.get("copied_from") or request.GET.get("copy_from")
        if not pk or not str(pk).isdigit():
            return None
        source = SupportEmail.objects.filter(pk=pk).first()
        # always link to the first email of the series, so "skip people who already got it" covers all copies
        return source.copied_from if source and source.copied_from_id else source

    @admin.action(description="Reuse for a new email (select one)")
    def reuse(self, request, queryset):
        if queryset.count() != 1:
            self.message_user(request, "Select exactly one email to reuse.", messages.WARNING)
            return None
        return HttpResponseRedirect(self._reuse_url(queryset.first()))

    @staticmethod
    def _reuse_url(email):
        return f"{reverse('admin:mailing_supportemail_add')}?copy_from={email.pk}"

    def get_fieldsets(self, request, obj=None):
        reused = bool(obj.copied_from_id) if obj else self._source_from(request) is not None
        hide = set()
        if not reused:
            hide |= {"copied_from", "reused_from", "skip_already_received"}
        if obj is None:  # new email: no preview or status yet; "reused from" is shown above the form
            hide |= {"message_preview", "reused_from"}
        if obj is not None:
            hide.add("copied_from")  # set once, on the new email page
        sets = []
        for name, options in self.fieldsets:
            if obj is None and name == "Status":
                continue
            sets.append((name, {**options, "fields": tuple(f for f in options["fields"] if f not in hide)}))
        return sets

    def get_readonly_fields(self, request, obj=None):
        if obj and obj.status != SupportEmail.Status.DRAFT:  # sent: everything read-only
            return (
                "subject", "message", "audience", "recipients", "position", "skip_already_received",
                *self.readonly_fields,
            )
        return self.readonly_fields

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        field = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == "message":  # roomy code box for the HTML
            field.widget.attrs.update(
                rows=20, spellcheck="false", style="width:100%;max-width:820px;font:13px/1.5 Consolas,Menlo,monospace"
            )
        if db_field.name == "copied_from":  # filled from ?copy_from=, never typed
            field.widget = forms.HiddenInput()
        return field

    def get_changeform_initial_data(self, request):
        initial = {"message": STARTER_MESSAGE}
        source = self._source_from(request)
        if source:
            copy = SupportEmail.objects.get(pk=request.GET["copy_from"]) if "copy_from" in request.GET else source
            initial = {
                "subject": copy.subject,
                "message": copy.message,
                "audience": copy.audience,
                "position": copy.position_id,
                "copied_from": source.pk,
            }
        given = super().get_changeform_initial_data(request)  # e.g. recipients from the Users page
        given.pop("copy_from", None)
        return {**initial, **given}


    def save_model(self, request, obj, form, change):
        if not obj.created_by_id:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def render_change_form(self, request, context, add=False, change=False, form_url="", obj=None):
        context["is_draft"] = obj is None or obj.status == SupportEmail.Status.DRAFT
        context["recipient_count"] = obj.recipient_users().count() if obj and obj.pk else None
        context["reuse_url"] = self._reuse_url(obj) if obj and obj.pk else None
        if add:  # "Start from a previous email" list
            context["previous_emails"] = SupportEmail.objects.only("pk", "subject", "status", "sent_at")[:PREVIOUS_LIMIT]
            context["copy_from"] = request.GET.get("copy_from", "")
            context["reuse_source"] = self._source_from(request)
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
