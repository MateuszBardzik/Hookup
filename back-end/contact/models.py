from django.db import models


class ContactMessage(models.Model):
    """A message sent with the "Contact us" form on the About page. Read them on the admin pages."""

    name = models.CharField(max_length=120)
    email = models.EmailField()
    message = models.TextField(max_length=5000)
    is_handled = models.BooleanField(default=False, help_text="Tick when you have answered it.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"
