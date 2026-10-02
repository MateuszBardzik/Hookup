from django.urls import path

from . import views

urlpatterns = [
    path("summary/", views.SummaryView.as_view(), name="portal-summary"),
    path("training/", views.TrainingListView.as_view(), name="portal-training"),
    path("training/<int:pk>/complete/", views.TrainingCompleteView.as_view(), name="portal-training-complete"),
    path("projects/", views.ProjectListView.as_view(), name="portal-projects"),
    path("tasks/", views.TaskListView.as_view(), name="portal-tasks"),
    path("tasks/<int:pk>/submit/", views.TaskSubmitView.as_view(), name="portal-task-submit"),
]
