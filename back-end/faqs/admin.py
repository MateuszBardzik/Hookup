"""Admin page for the landing-page FAQ. All database fields are editable."""

from django.contrib import admin

from config.admin_site import AdminOnlyModelAdmin, admin_site

from .models import Faq


@admin.register(Faq, site=admin_site)
class FaqAdmin(AdminOnlyModelAdmin):
    list_display = ("question", "is_active", "sort_order")
    list_editable = ("is_active", "sort_order")
    list_filter = ("is_active",)
    search_fields = ("question", "answer")
    readonly_fields = ("created_at",)
    fields = ("question", "answer", "is_active", "sort_order", "created_at")
