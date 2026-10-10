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
                "message": '<p style="margin:0 0 14px">Hello {name},</p>\n<p>New projects are <a href="https://engivexlab.com/positions">open</a>.</p>',
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
        self.assertIn('href="https://engivexlab.com"', html)  # logo links to the public site, never localhost
        self.assertNotIn("localhost", html)
        # nothing added after the message: no sign-off, no footer
        self.assertNotIn("team</p>", html)
        self.assertNotIn("©", html)
        self.assertEqual(to_ann.body.strip(), "Hello Ann,\n\nNew projects are open (https://engivexlab.com/positions).")
        self.assertIn('<p style="margin:0 0 14px">Hello Ann,</p>', html)

    def test_test_email_goes_only_to_me_and_stays_draft(self):
        self.client.post(
            self.add_url(),
            {"subject": "Hi", "message": "<p>Test body</p>", "audience": "all", "_send_test": "1"},
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


@override_settings(MAILING_SEND_NOW=True)
class ReuseTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(email="boss@example.com", password="Admin-pass-123", is_admin=True)
        self.ann = User.objects.create_user(email="ann@example.com", password="x-Pass-12345", email_verified=True)
        self.client.force_login(self.admin)
        self.original = SupportEmail.objects.create(subject="Welcome {name}", message="<p>Hello</p>", audience="verified")
        self.client.post(f"/hookup/mailing/supportemail/{self.original.pk}/change/", {
            "subject": "Welcome {name}", "message": "<p>Hello</p>", "audience": "verified", "_send_all": "1",
        })
        mail.outbox.clear()

    def reuse(self, source, **extra):
        data = {
            "copied_from": source.pk, "subject": source.subject, "message": source.message,
            "audience": "verified", "skip_already_received": "on", "_send_all": "1", **extra,
        }
        return self.client.post("/hookup/mailing/supportemail/add/", data)

    def test_sending_records_who_received_it(self):
        self.assertEqual(list(SupportEmail.objects.get(pk=self.original.pk).received_by.all()), [self.ann])

    def test_reuse_page_is_filled_from_the_original(self):
        page = self.client.get(f"/hookup/mailing/supportemail/add/?copy_from={self.original.pk}")
        self.assertContains(page, 'value="Welcome {name}"')
        self.assertContains(page, "&lt;p&gt;Hello&lt;/p&gt;")
        self.assertContains(page, "Skip people who already got it")
        self.assertContains(page, "Start from a previous email")
        # the original's page has the button
        original_page = self.client.get(f"/hookup/mailing/supportemail/{self.original.pk}/change/")
        self.assertContains(original_page, f"add/?copy_from={self.original.pk}")

    def test_reuse_keeps_recipients_from_users_page(self):
        page = self.client.get(
            f"/hookup/mailing/supportemail/add/?audience=selected&recipients={self.ann.pk}&copy_from={self.original.pk}"
        )
        self.assertContains(page, 'value="Welcome {name}"')
        self.assertContains(page, f'<option value="{self.ann.pk}" selected>')

    def test_copy_goes_only_to_new_people_and_series_grows(self):
        newbie = User.objects.create_user(email="new@example.com", password="x-Pass-12345", email_verified=True)
        self.reuse(self.original)
        self.assertEqual([m.to for m in mail.outbox], [["new@example.com"]])
        copy = SupportEmail.objects.exclude(pk=self.original.pk).get()
        self.assertEqual((copy.copied_from, copy.sent_count), (self.original, 1))

        # reusing the copy links to the original, and skips everyone who got any email of the series
        mail.outbox.clear()
        User.objects.create_user(email="newer@example.com", password="x-Pass-12345", email_verified=True)
        self.reuse(copy)
        self.assertEqual([m.to for m in mail.outbox], [["newer@example.com"]])
        self.assertEqual(SupportEmail.objects.filter(copied_from=self.original).count(), 2)
        self.assertNotIn(newbie, SupportEmail.objects.latest("created_at").recipient_users())

    def test_without_skip_everyone_gets_it_again(self):
        self.reuse(self.original, skip_already_received="")
        self.assertEqual([m.to for m in mail.outbox], [["ann@example.com"]])

    def test_list_action_opens_reuse_page(self):
        response = self.client.post(
            "/hookup/mailing/supportemail/", {"action": "reuse", "_selected_action": [self.original.pk]}
        )
        self.assertTrue(response["Location"].endswith(f"/add/?copy_from={self.original.pk}"))


class FormattingTests(TestCase):
    def render(self, message, name="Ann"):
        from .formatting import render_message

        return render_message(message, name)

    def test_html_used_as_is_with_safe_name(self):
        html, text = self.render('<h1 style="color:red">Hi {name}</h1><p>Body</p>', name="<b>Al</b>")
        self.assertEqual(html, '<h1 style="color:red">Hi &lt;b&gt;Al&lt;/b&gt;</h1><p>Body</p>')
        self.assertEqual(text, "Hi <b>Al</b>\n\nBody")  # plain-text version: tags removed, name as typed

    def test_plain_text_version_keeps_lines_and_link_addresses(self):
        _, text = self.render(
            '<p>Line one<br>line two</p>\n<p><a href="https://engivexlab.com/portal" style="x">Open it</a></p>'
            '<p><a href="https://engivexlab.com">https://engivexlab.com</a> &amp; more</p>'
        )
        self.assertEqual(
            text, "Line one\nline two\n\nOpen it (https://engivexlab.com/portal)\n\nhttps://engivexlab.com & more"
        )

    def test_new_email_starts_with_the_html_starter(self):
        User.objects.create_user(email="boss@example.com", password="Admin-pass-123", is_admin=True)
        self.client.login(email="boss@example.com", password="Admin-pass-123")
        page = self.client.get("/hookup/mailing/supportemail/add/")
        self.assertContains(page, "Hi {name},")
        self.assertNotContains(page, "Simple formatting")
