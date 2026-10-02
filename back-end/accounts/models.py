from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    """
    One table for everyone. People log in with their email (no username).

      is_admin = True  -> company staff / admin
      is_admin = False -> QA tester (default)

    Inherited from AbstractUser: password, first_name, last_name, is_active,
    is_staff, is_superuser, date_joined, last_login.
    """

    username = None  # removed: email is the login name
    email = models.EmailField("email address", unique=True)

    email_verified = models.BooleanField(
        default=False,
        help_text="Set when the user clicks the link in the verification email (or logs in with Google/Apple). "
        "Unverified users can't log in with a password.",
    )

    is_admin = models.BooleanField(
        default=False,
        help_text="Admins manage testers and positions. Everyone else is a tester.",
    )

    # ---- Profile page fields --------------------------------------------- #
    identity = models.CharField(max_length=150, blank=True)
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    linkedin_url = models.URLField("LinkedIn profile", blank=True)
    website = models.URLField("personal website", blank=True)
    photo = models.ImageField(upload_to="profile_photos/", blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # asked by `createsuperuser` besides email + password

    objects = UserManager()

    class Meta:
        ordering = ["email"]

    @property
    def is_tester(self) -> bool:
        return not self.is_admin

    @property
    def role(self) -> str:
        return "admin" if self.is_admin else "tester"

    def __str__(self) -> str:
        return f"{self.email} ({self.role})"
