"""
Admin page for users (testers and admins). All database fields are shown.

  is_admin   = can open these admin pages (and is an admin on the site)
  is_active  = uncheck to block an account without deleting it
  email_verified = ticked when the user clicked the link in the sign-up email (tick it by hand to skip that)
  Password   = stored hashed; use the "change password" link on a user's page.
  is_staff / is_superuser / groups / permissions are Django's own fields; the
  website doesn't use them (access is decided by is_admin).
"""

from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from config.admin_site import AdminOnlyModelAdmin, admin_site

from .models import User


class UserAddForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "is_admin", "email_verified")


class UserEditForm(UserChangeForm):
    class Meta:
        model = User
        fields = "__all__"


@admin.register(User, site=admin_site)
class UserAdmin(AdminOnlyModelAdmin, DjangoUserAdmin):
    form = UserEditForm
    add_form = UserAddForm

    list_display = ("email", "first_name", "last_name", "role_label", "email_verified", "is_active", "date_joined")
    list_editable = ("email_verified",)
    list_filter = ("is_admin", "email_verified", "is_active")
    search_fields = ("email", "first_name", "last_name", "phone")
    ordering = ("email",)
    readonly_fields = ("date_joined", "last_login")

    fieldsets = (
        ("Login", {"fields": ("email", "password")}),
        ("Name", {"fields": ("first_name", "last_name")}),
        ("Role and status", {"fields": ("is_admin", "email_verified", "is_active")}),
        ("Profile", {"fields": ("identity", "address", "phone", "linkedin_url", "website", "photo")}),
        ("Dates", {"fields": ("date_joined", "last_login")}),
        (
            "Django permissions (not used by the website)",
            {"classes": ("collapse",), "fields": ("is_staff", "is_superuser", "groups", "user_permissions")},
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "first_name", "last_name", "is_admin", "email_verified", "password1", "password2"),
            },
        ),
    )

    actions = ["write_email"]

    @admin.action(description="Write an email to the selected users")
    def write_email(self, request, queryset):
        """Opens a new support email (Emails to users) with these users as recipients."""
        ids = ",".join(str(pk) for pk in queryset.values_list("pk", flat=True))
        url = reverse("admin:mailing_supportemail_add")
        return HttpResponseRedirect(f"{url}?audience=selected&recipients={ids}")

    @admin.display(description="Role", ordering="is_admin")
    def role_label(self, obj):
        return "Admin" if obj.is_admin else "Tester"
