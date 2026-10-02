// Profile endpoints (back-end: accounts/views.py -> ProfileView)
import type { User } from '../types'
import { api } from './client'

export const profileApi = {
  get: () => api<User>('/profile/'),

  /** `data` is FormData when a new photo is attached, otherwise a plain object. */
  update: (data: Partial<User> | FormData) => api<User>('/profile/', 'PATCH', data),
}
