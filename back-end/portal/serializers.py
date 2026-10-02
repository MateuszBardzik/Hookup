from rest_framework import serializers

from .models import Project, Task, TrainingModule


class TrainingModuleSerializer(serializers.ModelSerializer):
    completed_at = serializers.DateTimeField(read_only=True, allow_null=True)  # set by the view

    class Meta:
        model = TrainingModule
        fields = ["id", "title", "description", "url", "duration", "completed_at"]


class ProjectSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    my_open_tasks = serializers.IntegerField(read_only=True)  # annotated by the view
    my_done_tasks = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        fields = ["id", "name", "description", "pay_per_task", "status", "status_label", "my_open_tasks", "my_done_tasks"]


class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    amount = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "project_name",
            "title",
            "instructions",
            "link",
            "amount",
            "status",
            "status_label",
            "review_note",
            "assigned_at",
            "submitted_at",
            "reviewed_at",
        ]
