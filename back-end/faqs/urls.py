from django.urls import path

from . import views

urlpatterns = [
    path("", views.FaqListView.as_view(), name="faq-list"),
]
