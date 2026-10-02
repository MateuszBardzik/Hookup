from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Project, Task, TrainingModule

User = get_user_model()


class PortalApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("tina@example.com", "Str0ng-pass-123")
        self.other = User.objects.create_user("bob@example.com", "Str0ng-pass-123")
        self.project = Project.objects.create(name="LLM ranking", pay_per_task=Decimal("10.00"))
        self.project.members.add(self.user)
        Project.objects.create(name="Not mine")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_login_required(self):
        self.assertEqual(APIClient().get("/api/portal/summary/").status_code, 401)

    def test_summary_numbers(self):
        Task.objects.create(project=self.project, worker=self.user, title="A")  # assigned
        Task.objects.create(project=self.project, worker=self.user, title="B", status="approved", pay=Decimal("25"))
        old = Task.objects.create(project=self.project, worker=self.user, title="C", status="approved")
        Task.objects.filter(pk=old.pk).update(reviewed_at=timezone.now() - timedelta(days=30))
        Task.objects.create(project=self.project, worker=self.other, title="Not mine", status="approved")

        data = self.client.get("/api/portal/summary/").data
        self.assertEqual(
            data["stats"],
            {"available_projects": 1, "assigned_tasks": 1, "completed_this_week": 1, "earnings": "35.00"},
        )
        self.assertEqual(data["recent_activity"][0]["kind"], "task_approved")

    def test_projects_and_tasks_are_mine_only(self):
        Task.objects.create(project=self.project, worker=self.user, title="Mine")
        Task.objects.create(project=self.project, worker=self.other, title="Theirs")
        projects = self.client.get("/api/portal/projects/").data
        self.assertEqual([(p["name"], p["my_open_tasks"]) for p in projects], [("LLM ranking", 1)])
        self.assertEqual([t["title"] for t in self.client.get("/api/portal/tasks/").data], ["Mine"])

    def test_submit_task(self):
        task = Task.objects.create(project=self.project, worker=self.user, title="A")
        res = self.client.post(f"/api/portal/tasks/{task.pk}/submit/")
        self.assertEqual(res.data["status"], "submitted")
        self.assertEqual(self.client.post(f"/api/portal/tasks/{task.pk}/submit/").status_code, 400)
        theirs = Task.objects.create(project=self.project, worker=self.other, title="B")
        self.assertEqual(self.client.post(f"/api/portal/tasks/{theirs.pk}/submit/").status_code, 404)

    def test_training_mark_done(self):
        module = TrainingModule.objects.create(title="Basics")
        self.assertIsNone(self.client.get("/api/portal/training/").data[0]["completed_at"])
        self.assertEqual(self.client.post(f"/api/portal/training/{module.pk}/complete/").status_code, 204)
        self.assertIsNotNone(self.client.get("/api/portal/training/").data[0]["completed_at"])
