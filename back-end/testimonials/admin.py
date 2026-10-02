"""Admin page for the landing-page feedback cards. All database fields are editable."""

from django.contrib import admin

from config.admin_site import AdminOnlyModelAdmin, admin_site

from .models import Testimonial


@admin.register(Testimonial, site=admin_site)
class TestimonialAdmin(AdminOnlyModelAdmin):
    list_display = ("author_name", "kind", "organization", "short_quote", "is_active", "sort_order")
    list_editable = ("is_active", "sort_order")
    list_filter = ("kind", "is_active")
    search_fields = ("author_name", "organization", "quote")
    readonly_fields = ("created_at",)
    fields = (
        "kind",
        "quote",
        "author_name",
        "author_title",
        "organization",
        "photo",
        "is_active",
        "sort_order",
        "created_at",
    )

    @admin.display(description="Quote")
    def short_quote(self, obj):
        return obj.quote if len(obj.quote) <= 80 else obj.quote[:77] + "..."
