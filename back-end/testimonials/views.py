"""
    GET /api/testimonials/   public -> active testimonials for the landing page
"""

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Testimonial
from .serializers import TestimonialSerializer


class TestimonialListView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        items = Testimonial.objects.filter(is_active=True)
        return Response(TestimonialSerializer(items, many=True).data)
