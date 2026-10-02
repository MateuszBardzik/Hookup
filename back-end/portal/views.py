"""
Worker portal API (login required). Everything is "mine": the logged-in user's own data.

    GET  /api/portal/summary/                 dashboard: 4 numbers + recent activity
    GET  /api/portal/training/                training modules (+ when I finished each)
    POST /api/portal/training/<id>/complete/  "Mark as done"
    GET  /api/portal/projects/                projects I'm a member of
    GET  /api/portal/tasks/                   my tasks (the Payments page uses the approved ones)
    POST /api/portal/tasks/<id>/submit/       "Mark as submitted"
"""

from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, OuterRef, Q, Subquery
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from positions.models import Application

from .models import Project, Task, TrainingCompletion, TrainingModule
from .serializers import ProjectSerializer, TaskSerializer, TrainingModuleSerializer

RECENT_ACTIVITY_COUNT = 6


class SummaryView(APIView):
    def get(self, request):
        user = request.user
        tasks = Task.objects.filter(worker=user).select_related("project")
        approved = [t for t in tasks if t.status == Task.Status.APPROVED]
        week_ago = timezone.now() - timedelta(days=7)

        stats = {
            "available_projects": user.projects.filter(status=Project.Status.ACTIVE).count(),
            "assigned_tasks": sum(1 for t in tasks if t.status in (Task.Status.ASSIGNED, Task.Status.REJECTED)),
            "completed_this_week": sum(1 for t in approved if t.reviewed_at and t.reviewed_at >= week_ago),
            "earnings": str(sum((t.amount for t in approved), Decimal("0"))),
        }
        return Response({"stats": stats, "recent_activity": recent_activity(user, tasks)})


def recent_activity(user, tasks):
    """Newest events first: task reviews/submissions, finished training, application updates."""
    events = []
    for t in tasks:
        if t.reviewed_at:
            done = t.status == Task.Status.APPROVED
            events.append(
                {
                    "kind": "task_approved" if done else "task_rejected",
                    "title": f"Task {'approved' if done else 'sent back'}: {t.title}",
                    "detail": t.project.name,
                    "at": t.reviewed_at,
                }
            )
        elif t.submitted_at:
            events.append(
                {"kind": "task_submitted", "title": f"Task submitted: {t.title}", "detail": t.project.name, "at": t.submitted_at}
            )
    for c in TrainingCompletion.objects.filter(user=user).select_related("module"):
        events.append({"kind": "training", "title": "Training module completed", "detail": c.module.title, "at": c.completed_at})
    for a in Application.objects.filter(user=user).select_related("position"):
        events.append(
            {
                "kind": "application",
                "title": f"Application: {a.get_stage_display()}" + (f" ({a.get_status_display()})" if a.status != "in_progress" else ""),
                "detail": a.position.title,
                "at": a.updated_at,
            }
        )
    events.sort(key=lambda e: e["at"], reverse=True)
    return events[:RECENT_ACTIVITY_COUNT]


class TrainingListView(APIView):
    def get(self, request):
        done = TrainingCompletion.objects.filter(user=request.user, module=OuterRef("pk")).values("completed_at")
        modules = TrainingModule.objects.filter(is_active=True).annotate(completed_at=Subquery(done[:1]))
        return Response(TrainingModuleSerializer(modules, many=True).data)


class TrainingCompleteView(APIView):
    def post(self, request, pk):
        module = get_object_or_404(TrainingModule, pk=pk, is_active=True)
        TrainingCompletion.objects.get_or_create(user=request.user, module=module)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectListView(APIView):
    def get(self, request):
        mine = Q(tasks__worker=request.user)
        projects = request.user.projects.annotate(
            my_open_tasks=Count("tasks", filter=mine & Q(tasks__status__in=["assigned", "rejected", "submitted"])),
            my_done_tasks=Count("tasks", filter=mine & Q(tasks__status="approved")),
        )
        return Response(ProjectSerializer(projects, many=True).data)


class TaskListView(APIView):
    def get(self, request):
        tasks = Task.objects.filter(worker=request.user).select_related("project")
        return Response(TaskSerializer(tasks, many=True).data)


class TaskSubmitView(APIView):
    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk, worker=request.user)
        if task.status not in (Task.Status.ASSIGNED, Task.Status.REJECTED):
            return Response({"detail": "This task was already submitted."}, status=status.HTTP_400_BAD_REQUEST)
        task.status = Task.Status.SUBMITTED
        task.submitted_at = timezone.now()
        task.reviewed_at = None
        task.save()
        return Response(TaskSerializer(task).data)
