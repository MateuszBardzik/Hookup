// Worker portal (back-end: portal/views.py). Login required; everything is the user's own data.
import type { PortalSummary, Project, Task, TrainingModule } from '../types'
import { api } from './client'

export const portalApi = {
  summary: () => api<PortalSummary>('/portal/summary/'),
  training: () => api<TrainingModule[]>('/portal/training/'),
  completeTraining: (id: number) => api<void>(`/portal/training/${id}/complete/`, 'POST'),
  projects: () => api<Project[]>('/portal/projects/'),
  tasks: () => api<Task[]>('/portal/tasks/'),
  submitTask: (id: number) => api<Task>(`/portal/tasks/${id}/submit/`, 'POST'),
}
