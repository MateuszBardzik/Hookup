"""
API endpoints for positions and applications.

    GET  /api/positions/                 -> public  active positions (Careers page, landing page)
    GET  /api/positions/<id>/            -> public  one position
    GET  /api/positions/applications/    -> login   my applications (hiring progress, qualification test)
    POST /api/positions/applications/    -> login   the Apply form (multipart: resume file)
"""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Application, Position
from .serializers import ApplicationSerializer, PositionSerializer


class PositionListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        positions = Position.objects.filter(is_active=True)
        return Response(PositionSerializer(positions, many=True).data)


class PositionDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        position = get_object_or_404(Position, pk=pk, is_active=True)
        return Response(PositionSerializer(position).data)


class ApplicationListView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        applications = Application.objects.filter(user=request.user).select_related("position", "user")
        return Response(ApplicationSerializer(applications, many=True, context={"request": request}).data)

    def post(self, request):
        serializer = ApplicationSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        return Response(
            ApplicationSerializer(application, context={"request": request}).data, status=status.HTTP_201_CREATED
        )
