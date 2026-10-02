// Old address /positions: the list moved to the Careers page.
import { Navigate } from 'react-router-dom'

export function PositionsPage() {
  return <Navigate to="/careers" replace />
}
