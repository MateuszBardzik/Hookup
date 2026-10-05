"""
The admin pages at /hookup/ (Django admin; address: settings.ADMIN_URL), used to manage the database.

Who can log in: users with  is_admin = True  (and is_active = True).
They can view, add, change and delete everything. Testers can't open it.

Each app registers its tables in its own admin.py:
    accounts/admin.py      users
    positions/admin.py     positions (+ old applications table)
    testimonials/admin.py  feedback cards
    faqs/admin.py          FAQ entries
    mailing/admin.py       support emails to users
The look (colours, logo) is in templates/admin/base_site.html.
"""

from django import forms
from django.conf import settings
from django.contrib import admin
from django.contrib.admin.forms import AdminAuthenticationForm


class AdminLoginForm(AdminAuthenticationForm):
    """Django's admin login, but it checks is_admin instead of is_staff."""

    def confirm_login_allowed(self, user):
        if not (user.is_active and getattr(user, "is_admin", False)):
            raise forms.ValidationError(
                "This account is not an admin. Ask an admin to set is_admin for it.",
                code="invalid_login",
            )


class SiteAdmin(admin.AdminSite):
    site_header = "engivexlab admin"
    site_title = "engivexlab admin"
    index_title = "Manage the website"
    login_form = AdminLoginForm

    @property
    def site_url(self):  # "View site" link
        return settings.FRONTEND_URL

    def has_permission(self, request):
        user = request.user
        return bool(user.is_active and getattr(user, "is_admin", False))


admin_site = SiteAdmin(name="admin")


class AdminOnlyModelAdmin(admin.ModelAdmin):
    """Base for every table: any is_admin user may do everything (no per-table permissions)."""

    def _is_admin(self, request):
        return admin_site.has_permission(request)

    def has_module_permission(self, request):
        return self._is_admin(request)

    def has_view_permission(self, request, obj=None):
        return self._is_admin(request)

    def has_add_permission(self, request):
        return self._is_admin(request)

    def has_change_permission(self, request, obj=None):
        return self._is_admin(request)

    def has_delete_permission(self, request, obj=None):
        return self._is_admin(request)
