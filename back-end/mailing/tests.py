from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, override_settings

from positions.models import Application, Position

from .models import SupportEmail

User = get_user_model()


@override_settings(MAILING_SEND_NOW=True, FRONTEND_URL="http://localhost:5173")
class SupportEmailTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(email="boss@example.com", password="Admin-pass-123", is_admin=True)
        self.ann = User.objects.create_user(email="ann@example.com", password="x-Pass-12345", first_name="Ann", email_verified=True)
        self.bob = User.objects.create_user(email="bob@example.com", password="x-Pass-12345", first_name="Bob")
        self.off = User.objects.create_user(email="off@example.com", password="x-Pass-12345", is_active=False, email_verified=True)
        self.client.force_login(self.admin)

    def add_url(self):
        return "/hookup/mailing/supportemail/add/"

    def test_audiences(self):
        email = SupportEmail.objects.create(subject="Hi", message="m", audience="verified")
        self.assertEqual(list(email.recipient_users()), [self.ann])  # inactive users never included
        email.audience = "all"
        self.assertEqual(set(email.recipient_users()), {self.admin, self.ann, self.bob})
        position = Position.objects.create(title="KiCAD Expert")
        Application.objects.create(user=self.bob, position=position)
        email.audience, email.position = "applicants", position
        self.assertEqual(list(email.recipient_users()), [self.bob])

    def test_send_to_selected_users_personalised_with_logo(self):
        response = self.client.post(
            self.add_url(),
            {
                "subject": "News for {name}",
                "format": "markdown",
                "message": "Hello {name},\n\nNew projects are open.",
                "audience": "selected",
                "recipients": [self.ann.pk, self.bob.pk],
                "_send_all": "1",
            },
        )
        self.assertEqual(response.status_code, 302)
        email = SupportEmail.objects.get()
        self.assertEqual((email.status, email.sent_count, email.created_by), ("sent", 2, self.admin))
        self.assertEqual(len(mail.outbox), 2)  # one personal copy each
        to_ann = next(m for m in mail.outbox if m.to == ["ann@example.com"])
        self.assertEqual(to_ann.subject, "News for Ann")
        self.assertIn("Hello Ann,", to_ann.body)
        self.assertEqual(to_ann.reply_to, ["support@engivexlab.com"])
        html = to_ann.alternatives[0][0]
        self.assertIn('src="cid:logo.png"', html)  # logo embedded in the email itself
        self.assertEqual(to_ann.attachments[0].get("Content-ID"), "<logo.png>")
        self.assertIn("https://engivexlab.com", html)  # public address in the footer, never localhost
        self.assertNotIn("localhost", html)
        self.assertIn('<p style="margin:0 0 14px">Hello Ann,</p>', html)

    def test_test_email_goes_only_to_me_and_stays_draft(self):
        self.client.post(
            self.add_url(),
            {"subject": "Hi", "format": "markdown", "message": "Test body", "audience": "all", "_send_test": "1"},
        )
        email = SupportEmail.objects.get()
        self.assertEqual(email.status, "draft")
        self.assertEqual([m.to for m in mail.outbox], [["boss@example.com"]])
        self.assertTrue(mail.outbox[0].subject.startswith("[TEST]"))

    def test_sent_email_cannot_be_sent_twice(self):
        email = SupportEmail.objects.create(subject="Hi", message="m", audience="all", status="sent")
        self.client.post(f"/hookup/mailing/supportemail/{email.pk}/change/", {"_send_all": "1"})
        self.assertEqual(len(mail.outbox), 0)

    def test_users_page_action_opens_email_for_selected(self):
        response = self.client.post(
            "/hookup/accounts/user/",
            {"action": "write_email", "_selected_action": [self.ann.pk, self.bob.pk]},
        )
        self.assertEqual(response.status_code, 302)
        self.assertIn("/hookup/mailing/supportemail/add/?audience=selected&recipients=", response["Location"])
        page = self.client.get(response["Location"])
        self.assertContains(page, "Save and send to all recipients")

    def test_testers_cannot_open_it(self):
        self.client.force_login(self.bob)
        self.assertEqual(self.client.get(self.add_url()).status_code, 302)  # to the admin login


class FormattingTests(TestCase):
    def render(self, message, fmt="markdown", name="Ann"):
        from .formatting import render_message

        return render_message(message, fmt, name)

    def test_plain_text_keeps_paragraphs_and_line_breaks(self):
        html, text = self.render("Hello {name},\nsecond line\n\nNew paragraph")
        self.assertIn("Hello Ann,<br />", html)
        self.assertEqual(html.count("<p "), 2)
        self.assertEqual(text, "Hello Ann,\nsecond line\n\nNew paragraph")

    def test_bold_links_lists_and_button(self):
        html, text = self.render(
            "**Big news**\n\n- one\n- two\n\n[our site](https://engivexlab.com)\n\n"
            "[button: Open your workspace](https://engivexlab.com/portal)"
        )
        self.assertIn("<strong>Big news</strong>", html)
        self.assertIn('<ul style=', html)
        self.assertIn('<a style="color:#4f35e6;text-decoration:underline" href="https://engivexlab.com">our site</a>', html)
        self.assertIn('href="https://engivexlab.com/portal" style="display:inline-block;background:#4f35e6', html)
        self.assertIn(">Open your workspace</a>", html)
        button = html[html.index('href="https://engivexlab.com/portal"') - 20 :]
        self.assertEqual(button[: button.index("</a>")].count("style="), 1)  # one style per tag
        self.assertIn("Open your workspace: https://engivexlab.com/portal", text)

    def test_html_typed_in_simple_mode_is_shown_as_text(self):
        html, _ = self.render("<script>alert(1)</script> [x](javascript:alert(1))")
        self.assertNotIn("<script>", html)
        self.assertNotIn('href="javascript', html)

    def test_html_format_used_as_is_with_safe_name(self):
        html, text = self.render('<h1 style="color:red">Hi {name}</h1><p>Body</p>', fmt="html", name="<b>Al</b>")
        self.assertIn('<h1 style="color:red">Hi &lt;b&gt;Al&lt;/b&gt;</h1>', html)
        self.assertIn("Hi <b>Al</b>", text)  # plain-text version: tags removed, name as typed
        self.assertIn("Body", text)
