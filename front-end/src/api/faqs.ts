// Landing-page FAQ (back-end: faqs/views.py). Public, no login.
import type { Faq } from '../types'
import { api } from './client'

export const faqsApi = {
  list: () => api<Faq[]>('/faqs/'),
}
