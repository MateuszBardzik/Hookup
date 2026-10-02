// Positions + applications (back-end: positions/views.py)
import type { Application, Position } from '../types'
import { api } from './client'

export const positionsApi = {
  /** Public, no login: active positions (Careers page, landing page). */
  list: () => api<Position[]>('/positions/'),

  get: (id: number) => api<Position>(`/positions/${id}/`),

  /** My applications with their hiring step (login). */
  myApplications: () => api<Application[]>('/positions/applications/'),

  /** The Apply form. FormData because of the resume file. */
  apply: (data: FormData) => api<Application>('/positions/applications/', 'POST', data),
}
