"""Admin pages for positions and applications. All database fields are editable (dates are read-only)."""

from django.contrib import admin

from config.admin_site import AdminOnlyModelAdmin, admin_site

from .models import Application, Position


@admin.register(Position, site=admin_site)
class PositionAdmin(AdminOnlyModelAdmin):
    list_display = ("title", "category", "employment_type", "pay", "location", "is_active", "sort_order")
    list_editable = ("is_active", "sort_order")  # change these straight from the list
    list_filter = ("category", "employment_type", "is_active")
    search_fields = ("title", "outline", "description")
    readonly_fields = ("created_at",)
    fieldsets = (
        (
            "Card (Careers page + landing page)",
            {"fields": ("title", "outline", "category", "highlights", "pay", "employment_type", "location", "countries")},
        ),
        (
            "Details popup (lists: one item per line)",
            {
                "fields": (
                    "description",
                    "responsibilities",
                    "requirements",
                    "why_apply",
                    "plugin_description",
                    "image",
                    "instruction_guideline",
                )
            },
        ),
        ("Qualification test (Google Form)", {"fields": ("test_instructions", "test_form_url")}),
        ("Visibility", {"fields": ("is_active", "sort_order", "created_at")}),
    )


@admin.register(Application, site=admin_site)
class ApplicationAdmin(AdminOnlyModelAdmin):
    """
    Hiring process: change `stage` (Apply -> Qualification test -> ID verification -> Training -> Project work)
    and `status` straight from the list. The applicant sees them on their dashboard.
    """

    list_display = ("full_name", "email", "position", "stage", "status", "id_verified", "created_at")
    list_editable = ("stage", "status", "id_verified")
    list_filter = ("stage", "status", "id_verified", "position")
    search_fields = ("full_name", "email", "user__email", "position__title")
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("user", "position")
    fieldsets = (
        ("Hiring process", {"fields": ("stage", "status", "id_verified", "admin_note")}),
        ("Applicant", {"fields": ("user", "position")}),
        ("Personal information", {"fields": ("full_name", "email", "phone", "location")}),
        ("Experience & skills", {"fields": ("related_experience", "resume")}),
        ("Additional information", {"fields": ("motivation", "availability", "agreed_terms")}),
        ("Dates", {"fields": ("created_at", "updated_at")}),
    )
