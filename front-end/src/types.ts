// Shapes of the JSON objects the back-end sends. Keep in sync with the
// Django serializers (accounts/serializers.py, positions/serializers.py).

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  identity: string
  address: string
  phone: string
  linkedin_url: string
  website: string
  photo: string | null // URL of the uploaded photo
  email_verified: boolean
}

export interface AuthResponse {
  token: string
  user: User
}

export interface AuthConfig {
  google_client_id: string
  apple_client_id: string
  apple_redirect_uri: string
}

export type PositionCategory =
  | 'pcb'
  | '3d'
  | 'character'
  | 'annotation'
  | 'ai_training'
  | 'evaluation'
  | 'qa'
  | 'other'

/** A role on the Careers page. List fields (highlights, ...) come from one-item-per-line text in the DB. */
export interface Position {
  id: number
  title: string
  outline: string
  highlights: string[]
  description: string
  responsibilities: string[]
  requirements: string[]
  why_apply: string[]
  plugin_description: string
  image: string | null
  instruction_guideline: string
  category: PositionCategory
  category_label: string
  employment_type: 'contract' | 'part_time' | 'full_time'
  employment_type_label: string
  location: string
  countries: string
  pay: string
}

/** Hiring steps, in order (back-end: positions/models.py -> Application.Stage). */
export type Stage = 1 | 2 | 3 | 4 | 5

export interface Application {
  id: number
  position: number
  position_title: string
  full_name: string
  email: string
  phone: string
  location: string
  related_experience: string
  resume: string | null
  motivation: string
  availability: string
  stage: Stage
  stage_label: string
  status: 'in_progress' | 'on_hold' | 'rejected' | 'withdrawn'
  status_label: string
  id_verified: boolean
  admin_note: string
  /** Filled in only once the application reached the Qualification test step. */
  test_instructions: string
  test_form_link: string
  created_at: string
  updated_at: string
}

export interface PortalSummary {
  stats: { available_projects: number; assigned_tasks: number; completed_this_week: number; earnings: string }
  recent_activity: {
    kind: 'task_approved' | 'task_rejected' | 'task_submitted' | 'training' | 'application'
    title: string
    detail: string
    at: string
  }[]
}

export interface TrainingModule {
  id: number
  title: string
  description: string
  url: string
  duration: string
  completed_at: string | null
}

export interface Project {
  id: number
  name: string
  description: string
  pay_per_task: string
  status: 'active' | 'paused' | 'completed'
  status_label: string
  my_open_tasks: number
  my_done_tasks: number
}

export interface Task {
  id: number
  project: number
  project_name: string
  title: string
  instructions: string
  link: string
  amount: string
  status: 'assigned' | 'submitted' | 'approved' | 'rejected'
  status_label: string
  review_note: string
  assigned_at: string
  submitted_at: string | null
  reviewed_at: string | null
}

export interface Testimonial {
  id: number
  kind: 'vendor' | 'user'
  quote: string
  author_name: string
  author_title: string
  organization: string
  photo: string | null
}

export interface Faq {
  id: number
  question: string
  answer: string
}
