// About page "Contact us" form (back-end: contact/views.py). Public, no login.
import { api } from './client'

export const contactApi = {
  send: (data: { name: string; email: string; message: string }) => api<{ sent: boolean }>('/contact/', 'POST', data),
}
