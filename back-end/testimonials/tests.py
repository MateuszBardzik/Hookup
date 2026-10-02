from django.test import TestCase
from rest_framework.test import APIClient

from .models import Testimonial


class TestimonialApiTests(TestCase):
    def setUp(self):
        Testimonial.objects.create(kind="vendor", quote="B", author_name="Second", sort_order=2)
        Testimonial.objects.create(kind="user", quote="A", author_name="First", sort_order=1)
        Testimonial.objects.create(kind="user", quote="hidden", author_name="Hidden", is_active=False)

    def test_public_list_active_in_order(self):
        res = APIClient().get("/api/testimonials/")  # no login needed
        self.assertEqual(res.status_code, 200)
        self.assertEqual([t["author_name"] for t in res.data], ["First", "Second"])
        self.assertEqual(res.data[1]["kind"], "vendor")
