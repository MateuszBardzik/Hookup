"""
    GET /api/faqs/   public -> active FAQ entries for the landing page
"""

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Faq
from .serializers import FaqSerializer


class FaqListView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response(FaqSerializer(Faq.objects.filter(is_active=True), many=True).data)
