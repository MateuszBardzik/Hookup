from django.urls import path

from . import views

urlpatterns = [
    path("", views.PositionListView.as_view(), name="position-list"),
    path("<int:pk>/", views.PositionDetailView.as_view(), name="position-detail"),
    path("applications/", views.ApplicationListView.as_view(), name="application-list"),
]
