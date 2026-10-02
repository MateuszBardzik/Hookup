// Authentication endpoints (back-end: accounts/views.py)
import type { AuthConfig, AuthResponse } from '../types'
import { api } from './client'

export interface SignupData {
  first_name: string
  last_name: string
  email: string
  password: string
}

export const authApi = {
  config: () => api<AuthConfig>('/auth/config/'),

  /** Creates the account and emails a verification link (no login until it's clicked). */
  signup: (data: SignupData) => api<{ email: string; verification_sent: boolean }>('/auth/signup/', 'POST', data),

  /** uid + token come from the link in the email. Success = verified and logged in. */
  verifyEmail: (uid: string, token: string) => api<AuthResponse>('/auth/verify-email/', 'POST', { uid, token }),

  resendVerification: (email: string) => api<{ sent: boolean }>('/auth/resend-verification/', 'POST', { email }),

  login: (email: string, password: string) => api<AuthResponse>('/auth/login/', 'POST', { email, password }),

  google: (credential: string) => api<AuthResponse>('/auth/google/', 'POST', { credential }),

  apple: (id_token: string, first_name = '', last_name = '') =>
    api<AuthResponse>('/auth/apple/', 'POST', { id_token, first_name, last_name }),

  logout: () => api<void>('/auth/logout/', 'POST'),
}
