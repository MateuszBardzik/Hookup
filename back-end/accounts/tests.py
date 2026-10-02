import re
from unittest import mock

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

User = get_user_model()
PASSWORD = "Str0ng-pass-123"


class UserModelTests(TestCase):
    def test_new_user_is_tester_by_default(self):
        user = User.objects.create_user("Tina@Example.com", PASSWORD)
        self.assertEqual(user.email, "tina@example.com")
        self.assertTrue(user.is_tester)
        self.assertEqual(User.objects.testers().count(), 1)

    def test_superuser_is_admin(self):
        su = User.objects.create_superuser("root@example.com", PASSWORD)
        self.assertTrue(su.is_admin)
        self.assertEqual(list(User.objects.admins()), [su])


class AuthApiTests(TestCase):
    def setUp(self):
        cache.clear()  # reset rate limits
        self.client = APIClient()

    def signup(self, **overrides):
        data = {"first_name": "Tina", "last_name": "Test", "email": "tina@example.com", "password": PASSWORD}
        data.update(overrides)
        return self.client.post("/api/auth/signup/", data, format="json")

    def link_from_email(self):
        """uid and token from the link in the last email sent."""
        body = mail.outbox[-1].body
        query = re.search(r"/verify-email\?uid=([\w-]+)&token=([\w-]+)", body)
        return {"uid": query.group(1), "token": query.group(2)}

    def login(self, email="tina@example.com", password=PASSWORD):
        return self.client.post("/api/auth/login/", {"email": email, "password": password}, format="json")

    def test_signup_sends_verification_email_and_no_token(self):
        res = self.signup()
        self.assertEqual(res.status_code, 201)
        self.assertNotIn("token", res.data)
        self.assertEqual(res.data["email"], "tina@example.com")
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["tina@example.com"])
        self.assertIn("http://localhost:5173/verify-email?uid=", mail.outbox[0].body)
        self.assertFalse(User.objects.get(email="tina@example.com").email_verified)

    def test_unverified_user_cannot_log_in(self):
        self.signup()
        res = self.login()
        self.assertEqual(res.status_code, 403)
        self.assertEqual(res.data["code"], "email_not_verified")
        self.assertNotIn("token", res.data)

    def test_verify_link_logs_in_and_works_once(self):
        self.signup()
        link = self.link_from_email()
        res = self.client.post("/api/auth/verify-email/", link, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertIn("token", res.data)
        self.assertTrue(res.data["user"]["email_verified"])
        self.assertEqual(self.login(email="TINA@example.com").status_code, 200)
        again = self.client.post("/api/auth/verify-email/", link, format="json")
        self.assertEqual(again.status_code, 400)
        self.assertEqual(again.data["code"], "invalid_link")

    def test_mail_server_down_does_not_break_signup(self):
        with mock.patch("accounts.emails._send", side_effect=TimeoutError("no route")):
            res = self.signup()
            self.assertEqual(res.status_code, 201)
            self.assertFalse(res.data["verification_sent"])
            resend = self.client.post("/api/auth/resend-verification/", {"email": "tina@example.com"})
            self.assertEqual(resend.status_code, 503)
        self.assertTrue(User.objects.filter(email="tina@example.com").exists())

    def test_bad_link(self):
        res = self.client.post("/api/auth/verify-email/", {"uid": "xx", "token": "nope"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_resend_verification(self):
        self.signup()
        mail.outbox.clear()
        self.assertEqual(self.client.post("/api/auth/resend-verification/", {"email": "tina@example.com"}).status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        # unknown address: same answer, no email (doesn't reveal which emails have accounts)
        self.assertEqual(self.client.post("/api/auth/resend-verification/", {"email": "nobody@example.com"}).status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        # the new link works
        self.assertEqual(self.client.post("/api/auth/verify-email/", self.link_from_email(), format="json").status_code, 200)

    def test_signup_duplicate_email(self):
        self.signup()
        res = self.signup()
        self.assertEqual(res.status_code, 400)
        self.assertIn("email", res.data)

    def test_signup_weak_password(self):
        res = self.signup(password="123")
        self.assertEqual(res.status_code, 400)

    def test_wrong_password(self):
        User.objects.create_user("tina@example.com", PASSWORD, email_verified=True)
        self.assertEqual(self.login(password="wrong").status_code, 400)

    def verified_token(self):
        User.objects.create_user("tina@example.com", PASSWORD, first_name="Tina", email_verified=True)
        return self.login().data["token"]

    def test_profile_requires_login_and_updates(self):
        self.assertEqual(self.client.get("/api/profile/").status_code, 401)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.verified_token()}")
        res = self.client.patch("/api/profile/", {"phone": "+1 555 0100", "email": "x@y.com"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["phone"], "+1 555 0100")
        self.assertEqual(res.data["email"], "tina@example.com")  # email is read-only

    def test_logout_invalidates_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.verified_token()}")
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 204)
        self.assertEqual(self.client.get("/api/profile/").status_code, 401)

    @override_settings(GOOGLE_CLIENT_ID="test-client")
    def test_google_login_creates_user(self):
        fake = {"email": "g@example.com", "email_verified": True, "given_name": "Gina", "family_name": "G"}
        with mock.patch("accounts.social.google_id_token.verify_oauth2_token", return_value=fake):
            res = self.client.post("/api/auth/google/", {"credential": "abc"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["user"]["first_name"], "Gina")
        self.assertTrue(res.data["user"]["email_verified"])  # Google already verified the address

    def test_google_login_not_configured(self):
        res = self.client.post("/api/auth/google/", {"credential": "abc"}, format="json")
        self.assertEqual(res.status_code, 400)


class AdminPagesTests(TestCase):
    """/admin/ is only for users with is_admin = True."""

    def setUp(self):
        self.admin = User.objects.create_user(email="boss@example.com", password="Admin-pass-123", is_admin=True)
        self.tester = User.objects.create_user(email="tester@example.com", password="Tester-pass-123")

    def test_admin_can_open_every_table(self):
        self.client.force_login(self.admin)
        for url in [
            "/admin/",
            "/admin/accounts/user/",
            "/admin/accounts/user/add/",
            f"/admin/accounts/user/{self.tester.pk}/change/",
            "/admin/positions/position/",
            "/admin/positions/position/add/",
            "/admin/positions/application/",
            "/admin/testimonials/testimonial/",
            "/admin/testimonials/testimonial/add/",
            "/admin/faqs/faq/",
            "/admin/faqs/faq/add/",
            "/admin/positions/application/add/",
            "/admin/portal/project/",
            "/admin/portal/project/add/",
            "/admin/portal/task/",
            "/admin/portal/task/add/",
            "/admin/portal/trainingmodule/",
            "/admin/portal/trainingcompletion/",
            "/admin/contact/contactmessage/",
        ]:
            self.assertEqual(self.client.get(url).status_code, 200, url)

    def test_tester_is_sent_to_login(self):
        self.client.force_login(self.tester)
        self.assertEqual(self.client.get("/admin/").status_code, 302)

    def test_login_form_checks_is_admin(self):
        ok = self.client.post("/admin/login/", {"username": "boss@example.com", "password": "Admin-pass-123"})
        self.assertEqual(ok.status_code, 302)
        self.client.logout()
        bad = self.client.post("/admin/login/", {"username": "tester@example.com", "password": "Tester-pass-123"})
        self.assertContains(bad, "not an admin")

    def test_admin_can_add_a_user(self):
        self.client.force_login(self.admin)
        response = self.client.post(
            "/admin/accounts/user/add/",
            {
                "email": "new@example.com",
                "first_name": "New",
                "last_name": "Person",
                "password1": "Some-strong-pass-9",
                "password2": "Some-strong-pass-9",
            },
        )
        self.assertEqual(response.status_code, 302, getattr(response, "context", None) and response.context.get("errors"))
        self.assertTrue(User.objects.get(email="new@example.com").check_password("Some-strong-pass-9"))


@override_settings(
    EMAIL_BACKEND="config.mailgun_backend.MailgunBackend",
    MAILGUN_API_KEY="key-test",
    MAILGUN_DOMAIN="mg.example.com",
    MAILGUN_API_URL="https://api.mailgun.net",
)
class MailgunBackendTests(TestCase):
    def _send(self, status_code=200):
        from django.core.mail import send_mail

        response = mock.Mock(status_code=status_code, text="error text")
        with mock.patch("config.mailgun_backend.requests.post", return_value=response) as post:
            send_mail("Hi", "plain", "engivexlab <no-reply@mg.example.com>", ["a@b.com"], html_message="<b>hi</b>")
        return post

    def test_posts_to_mailgun_api(self):
        post = self._send()
        url = post.call_args.args[0]
        kwargs = post.call_args.kwargs
        self.assertEqual(url, "https://api.mailgun.net/v3/mg.example.com/messages")
        self.assertEqual(kwargs["auth"], ("api", "key-test"))
        self.assertEqual(kwargs["data"]["to"], ["a@b.com"])
        self.assertEqual(kwargs["data"]["text"], "plain")
        self.assertEqual(kwargs["data"]["html"], "<b>hi</b>")

    def test_api_error_raises(self):
        with self.assertRaises(RuntimeError):
            self._send(status_code=401)
