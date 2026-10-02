/**
 * All pages (routes) of the site.
 *
 * Public website (header + footer, see components/Layout.tsx)
 *   /            home page
 *   /services    our services
 *   /careers     open positions, required skills, hiring process
 *   /about       mission, values, team, contact form
 *   /apply       application form (?position=<id>); asks to sign up / log in first
 *   /verify-email  opened from the link in the sign-up email
 *
 * Worker portal (sidebar, see features/portal/PortalLayout.tsx) – login required
 *   /portal                 dashboard
 *   /portal/positions       all open positions (apply from here)
 *   /portal/applications    hiring progress of each application
 *   /portal/training        training modules
 *   /portal/tests           qualification tests (Google Forms)
 *   /portal/projects        my projects
 *   /portal/tasks           my tasks
 *   /portal/payments        earnings
 *   /portal/profile         profile
 *
 * Old addresses /positions and /profile redirect to /careers and /portal/profile.
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'
import { PortalLayout } from './features/portal/PortalLayout'
import { AboutPage } from './pages/AboutPage'
import { ApplyPage } from './pages/ApplyPage'
import { CareersPage } from './pages/CareersPage'
import { LandingPage } from './pages/LandingPage'
import { ApplicationsPage } from './pages/portal/ApplicationsPage'
import { DashboardPage } from './pages/portal/DashboardPage'
import { PaymentsPage } from './pages/portal/PaymentsPage'
import { PortalPositionsPage } from './pages/portal/PositionsPage'
import { ProjectsPage } from './pages/portal/ProjectsPage'
import { TasksPage } from './pages/portal/TasksPage'
import { TestsPage } from './pages/portal/TestsPage'
import { TrainingPage } from './pages/portal/TrainingPage'
import { PositionsPage } from './pages/PositionsPage'
import { ProfilePage } from './pages/ProfilePage'
import { ServicesPage } from './pages/ServicesPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/positions" element={<PositionsPage />} />
            <Route path="/profile" element={<Navigate to="/portal/profile" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          <Route
            path="/portal"
            element={
              <RequireAuth>
                <PortalLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="positions" element={<PortalPositionsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="training" element={<TrainingPage />} />
            <Route path="tests" element={<TestsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
