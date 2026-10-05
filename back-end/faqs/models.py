from django.db import models


class Faq(models.Model):
    """
    One question + answer in the FAQ section of the landing page.
    Add / edit rows on the admin pages (/hookup/) or with a database tool. Line breaks in `answer` are kept.
    """

    question = models.CharField(max_length=255)
    answer = models.TextField()

    is_active = models.BooleanField(default=True, help_text="Uncheck to hide it from the site.")
    sort_order = models.PositiveIntegerField(default=0, help_text="Lower numbers show first.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"

    def __str__(self) -> str:
        return self.question
