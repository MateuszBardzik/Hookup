from django.conf import settings
from django.db import models


def lines(text: str) -> list[str]:
    """Split a multi-line text field into a list of non-empty lines (for bullet lists)."""
    return [line.strip(" -•\t") for line in (text or "").splitlines() if line.strip(" -•\t")]


class Position(models.Model):
    """
    A role people can apply for, e.g. "KiCAD Expert" or "AI Evaluator".
    Add / edit rows on the admin pages (/hookup/) or with a database tool.

    Careers page card:          category (icon), title, outline, highlights (check list), pay, location
    Details popup:              + employment_type, countries, description, responsibilities, requirements,
                                  why_apply, plugin_description, image, instruction_guideline
    Qualification test (portal, once an admin moves the application to that step):
                                test_instructions + a button to test_form_url
    Fields that hold lists (highlights, responsibilities, requirements, why_apply): one item per line.
    """

    class Category(models.TextChoices):
        PCB = "pcb", "PCB design"
        MODELING_3D = "3d", "3D modeling"
        CHARACTER = "character", "3D character design"
        ANNOTATION = "annotation", "Data annotation"
        AI_TRAINING = "ai_training", "AI training data"
        EVALUATION = "evaluation", "AI/LLM evaluation"
        QA = "qa", "QA testing"
        OTHER = "other", "Other"

    class EmploymentType(models.TextChoices):
        CONTRACT = "contract", "Contract"
        PART_TIME = "part_time", "Part-time"
        FULL_TIME = "full_time", "Full-time"

    title = models.CharField(max_length=120)
    outline = models.TextField(help_text="Short summary shown on the card.")
    highlights = models.TextField(
        blank=True, help_text='Check list on the card, one per line, e.g. "Training provided".'
    )
    description = models.TextField(blank=True)
    responsibilities = models.TextField(blank=True, help_text="One per line.")
    requirements = models.TextField(blank=True, help_text="Skills / experience needed, one per line.")
    why_apply = models.TextField(blank=True, help_text="Reasons to apply, one per line.")
    plugin_description = models.TextField(blank=True)
    image = models.ImageField(upload_to="positions/", blank=True)
    instruction_guideline = models.TextField(blank=True)

    category = models.CharField(max_length=12, choices=Category.choices, default=Category.OTHER)
    employment_type = models.CharField(
        max_length=10, choices=EmploymentType.choices, default=EmploymentType.CONTRACT
    )
    location = models.CharField(max_length=60, default="Remote", blank=True)
    countries = models.CharField(
        max_length=255, blank=True, help_text='Where applicants must live, e.g. "United States, Canada, Brazil".'
    )
    pay = models.CharField(max_length=60, blank=True, help_text='e.g. "$45/hr" or "$200 per task". Empty = hidden.')

    # Qualification test = a Google Form (answers stay in Google Forms)
    test_instructions = models.TextField(
        blank=True, help_text="Shown on the Qualification test page of the portal. Line breaks are kept."
    )
    test_form_url = models.URLField(
        max_length=1000,
        blank=True,
        help_text="Google Form link. May contain {name}, {first_name}, {last_name}, {email} "
        "which are replaced with the logged-in user's details.",
    )

    is_active = models.BooleanField(default=True, help_text="Uncheck to hide it from the site.")
    sort_order = models.PositiveIntegerField(default=0, help_text="Lower numbers show first.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "title"]

    def __str__(self) -> str:
        return self.title


class Application(models.Model):
    """
    Someone applied to a position with the Apply form. One application per user per position.

    `stage` is the hiring step:
        1 Apply -> 2 Qualification test -> 3 ID verification -> 4 Training -> 5 Project work
    Submitting the Apply form moves it to 2 automatically (the test opens right away);
    admins move it forward from there on the admin pages.
    `status` says whether the person is still in the process.
    """

    class Stage(models.IntegerChoices):
        APPLIED = 1, "Apply"
        QUALIFICATION = 2, "Qualification test"
        ID_VERIFICATION = 3, "ID verification"
        TRAINING = 4, "Training"
        PROJECT_WORK = 5, "Project work"

    class Status(models.TextChoices):
        IN_PROGRESS = "in_progress", "In progress"
        ON_HOLD = "on_hold", "On hold"
        REJECTED = "rejected", "Not selected"
        WITHDRAWN = "withdrawn", "Withdrawn"

    class Availability(models.TextChoices):
        UNDER_10 = "under_10", "Less than 10 hours / week"
        H10_20 = "10_20", "10 - 20 hours / week"
        H20_40 = "20_40", "20 - 40 hours / week"
        OVER_40 = "over_40", "40+ hours / week"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="applications")
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name="applications")

    # Apply form: personal information
    full_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    location = models.CharField("location (city, country)", max_length=120, blank=True)
    # Apply form: experience & skills
    related_experience = models.TextField(blank=True)
    resume = models.FileField(upload_to="resumes/", blank=True)
    # Apply form: additional information
    motivation = models.TextField("why they want to join", blank=True)
    availability = models.CharField(max_length=10, choices=Availability.choices, blank=True)
    agreed_terms = models.BooleanField(default=False)

    # Hiring process (admins change these)
    stage = models.PositiveSmallIntegerField(choices=Stage.choices, default=Stage.APPLIED)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.IN_PROGRESS)
    id_verified = models.BooleanField("ID verified", default=False, help_text="Tick after checking their ID.")
    admin_note = models.TextField(blank=True, help_text="Shown to the applicant on their dashboard.")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "position"], name="unique_application_per_user"),
        ]

    def __str__(self) -> str:
        return f"{self.user} -> {self.position}"
