from django.test import TestCase
from rest_framework.test import APIClient

from .models import Faq


class FaqApiTests(TestCase):
    def test_public_list_active_in_order(self):
        Faq.objects.create(question="Second?", answer="b", sort_order=2)
        Faq.objects.create(question="First?", answer="a", sort_order=1)
        Faq.objects.create(question="Hidden?", answer="x", is_active=False)
        res = APIClient().get("/api/faqs/")  # no login needed
        self.assertEqual(res.status_code, 200)
        self.assertEqual([f["question"] for f in res.data], ["First?", "Second?"])
