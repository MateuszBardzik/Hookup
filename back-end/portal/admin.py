"""Admin pages for the worker portal: training, projects and tasks. All database fields are editable."""

from django.contrib import admin
from django.utils import timezone

from config.admin_site import AdminOnlyModelAdmin, admin_site

from .models import Project, Task, TrainingCompletion, TrainingModule


@admin.register(TrainingModule, site=admin_site)
class TrainingModuleAdmin(AdminOnlyModelAdmin):
    list_display = ("title", "duration", "is_active", "sort_order")
    list_editable = ("is_active", "sort_order")
    search_fields = ("title", "description")


@admin.register(TrainingCompletion, site=admin_site)
class TrainingCompletionAdmin(AdminOnlyModelAdmin):
    list_display = ("user", "module", "completed_at")
    list_filter = ("module",)
    search_fields = ("user__email",)
    readonly_fields = ("completed_at",)
    autocomplete_fields = ("user",)


class TaskInline(admin.TabularInline):
    model = Task
    extra = 0
    fields = ("title", "worker", "status", "pay", "link")
    autocomplete_fields = ("worker",)
    show_change_link = True


@admin.register(Project, site=admin_site)
class ProjectAdmin(AdminOnlyModelAdmin):
    list_display = ("name", "status", "pay_per_task", "member_count", "created_at")
    list_editable = ("status",)
    list_filter = ("status",)
    search_fields = ("name", "description")
    filter_horizontal = ("members",)  # pick workers from a list
    readonly_fields = ("created_at",)
    inlines = [TaskInline]

    @admin.display(description="Members")
    def member_count(self, obj):
        return obj.members.count()


@admin.register(Task, site=admin_site)
class TaskAdmin(AdminOnlyModelAdmin):
    list_display = ("title", "project", "worker", "status", "pay", "submitted_at", "reviewed_at")
    list_editable = ("status",)
    list_filter = ("status", "project")
    search_fields = ("title", "worker__email", "project__name")
    autocomplete_fields = ("worker", "project")
    readonly_fields = ("assigned_at",)
    actions = ["approve", "reject"]

    @admin.action(description="Approve selected tasks (they count as paid)")
    def approve(self, request, queryset):
        queryset.update(status=Task.Status.APPROVED, reviewed_at=timezone.now())

    @admin.action(description="Send selected tasks back (rejected)")
    def reject(self, request, queryset):
        queryset.update(status=Task.Status.REJECTED, reviewed_at=timezone.now())

    def save_model(self, request, obj, form, change):
        # A new review (status changed to approved/rejected) gets a fresh review date
        if change and "status" in form.changed_data:
            obj.reviewed_at = timezone.now() if obj.status in ("approved", "rejected") else None
        super().save_model(request, obj, form, change)
