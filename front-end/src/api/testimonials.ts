// Landing-page feedback (back-end: testimonials/views.py). Public, no login.
import type { Testimonial } from '../types'
import { api } from './client'

export const testimonialsApi = {
  list: () => api<Testimonial[]>('/testimonials/'),
}
