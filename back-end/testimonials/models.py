from django.db import models


class Testimonial(models.Model):
    """
    Feedback shown on the landing page ("What vendors and users say").
    Add / edit rows on the admin pages (/admin/) or with a database tool.
    """

    class Kind(models.TextChoices):
        VENDOR = "vendor", "Vendor"
        USER = "user", "User"

    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.USER)
    quote = models.TextField()
    author_name = models.CharField(max_length=120)
    author_title = models.CharField(max_length=120, blank=True, help_text='e.g. "Hardware Engineer"')
    organization = models.CharField(max_length=120, blank=True, help_text="Company or vendor name")
    photo = models.ImageField(upload_to="testimonials/", blank=True)

    is_active = models.BooleanField(default=True, help_text="Uncheck to hide it from the site.")
    sort_order = models.PositiveIntegerField(default=0, help_text="Lower numbers show first.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "-created_at"]

    def __str__(self) -> str:
        return f"{self.author_name} ({self.kind})"
