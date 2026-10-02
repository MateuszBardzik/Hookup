"""Admin page for messages sent with the About page's "Contact us" form."""

from django.contrib import admin

from config.admin_site import AdminOnlyModelAdmin, admin_site

from .models import ContactMessage


@admin.register(ContactMessage, site=admin_site)
class ContactMessageAdmin(AdminOnlyModelAdmin):
    list_display = ("name", "email", "short_message", "is_handled", "created_at")
    list_editable = ("is_handled",)
    list_filter = ("is_handled",)
    search_fields = ("name", "email", "message")
    readonly_fields = ("created_at",)

    @admin.display(description="Message")
    def short_message(self, obj):
        return obj.message if len(obj.message) <= 80 else obj.message[:77] + "..."
