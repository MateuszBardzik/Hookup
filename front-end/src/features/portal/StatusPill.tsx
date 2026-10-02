// Coloured label for statuses (application, project, task).
import styles from './Portal.module.css'

const TONE: Record<string, string> = {
  in_progress: styles.pill,
  on_hold: styles.pillWarn,
  rejected: styles.pillBad,
  withdrawn: styles.pillMuted,
  active: styles.pillGood,
  paused: styles.pillWarn,
  completed: styles.pillMuted,
  assigned: styles.pill,
  submitted: styles.pillWarn,
  approved: styles.pillGood,
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  return <span className={TONE[status] ?? styles.pill}>{label}</span>
}
