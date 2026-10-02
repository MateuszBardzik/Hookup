from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from .models import ContactMessage


class ContactApiTests(TestCase):
    def setUp(self):
        cache.clear()  # reset the rate limit between tests

    def test_send_message_without_login(self):
        res = APIClient().post("/api/contact/", {"name": "Ann", "email": "ann@example.com", "message": "Hi!"})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(ContactMessage.objects.get().name, "Ann")

    def test_validation(self):
        res = APIClient().post("/api/contact/", {"name": "", "email": "bad", "message": ""})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(set(res.data), {"name", "email", "message"})

    def test_rate_limited(self):
        client = APIClient()
        for _ in range(5):
            client.post("/api/contact/", {"name": "A", "email": "a@example.com", "message": "x"})
        self.assertEqual(client.post("/api/contact/", {"name": "A", "email": "a@example.com", "message": "x"}).status_code, 429)
