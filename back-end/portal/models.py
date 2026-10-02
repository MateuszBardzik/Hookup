"""
Worker portal data (the dashboard testers see after logging in).
All rows are created by admins on the admin pages (/admin/).

    TrainingModule      a lesson (link to a doc/video) everyone in the Training step should do
    TrainingCompletion  a user clicked "Mark as done" on a module
    Project             a piece of client work, e.g. "KiCAD plugin regression" or "LLM answer ranking"
    Task                one unit of work in a project, assigned to one worker; approved tasks = earnings
"""

from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone


class TrainingModule(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    url = models.URLField("link to the material", max_length=1000, blank=True, help_text="Doc, video, slides...")
    duration = models.CharField(max_length=40, blank=True, help_text='e.g. "20 min"')
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0, help_text="Lower numbers show first.")

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self) -> str:
        return self.title


class TrainingCompletion(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="training_done")
    module = models.ForeignKey(TrainingModule, on_delete=models.CASCADE, related_name="completions")
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]
        constraints = [models.UniqueConstraint(fields=["user", "module"], name="unique_training_completion")]

    def __str__(self) -> str:
        return f"{self.user} finished {self.module}"


class Project(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PAUSED = "paused", "Paused"
        COMPLETED = "completed", "Completed"

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    pay_per_task = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("0"))
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="projects", blank=True, help_text="Workers who see this project."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


class Task(models.Model):
    """
    assigned  -> the worker sees it in "My tasks" and does the work (link = where to do it)
    submitted -> the worker clicked "Mark as submitted"
    approved  -> an admin accepted it: counts as done and is paid (Payments page)
    rejected  -> an admin sent it back (the worker sees the note)
    """

    class Status(models.TextChoices):
        ASSIGNED = "assigned", "Assigned"
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    worker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    instructions = models.TextField(blank=True)
    link = models.URLField("where to do the task", max_length=1000, blank=True)
    pay = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True, help_text="Empty = the project's pay per task."
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ASSIGNED)
    review_note = models.TextField(blank=True, help_text="Shown to the worker.")
    assigned_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-assigned_at"]

    def __str__(self) -> str:
        return f"{self.title} ({self.worker})"

    @property
    def amount(self) -> Decimal:
        return self.pay if self.pay is not None else self.project.pay_per_task

    def save(self, *args, **kwargs):
        # Remember when an admin approved / rejected it (used for "completed this week" and payments)
        if self.status in (self.Status.APPROVED, self.Status.REJECTED) and not self.reviewed_at:
            self.reviewed_at = timezone.now()
        super().save(*args, **kwargs)
