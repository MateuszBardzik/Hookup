/** /portal/applications — each application with its hiring progress (1 Apply … 5 Project work). */
import { Link } from 'react-router-dom'
import { positionsApi } from '../../api/positions'
import { HiringSteps } from '../../features/hiring/HiringSteps'
import { formatDate } from '../../features/portal/format'
import { PortalHeading } from '../../features/portal/PortalLayout'
import styles from '../../features/portal/Portal.module.css'
import { StatusPill } from '../../features/portal/StatusPill'
import { useLoad } from '../../features/portal/useLoad'

/** What the applicant should do at each step. */
const NEXT: Record<number, string> = {
  1: 'We are reviewing your application.',
  2: 'Take the qualification test for this position.',
  3: 'We will contact you by email to verify your ID.',
  4: 'Complete the training modules to get ready for project work.',
  5: 'You are ready for project work. Check your projects and tasks.',
}

export function ApplicationsPage() {
  const { data: applications, error } = useLoad(positionsApi.myApplications)

  return (
    <>
      <PortalHeading title="My applications" subtitle="Follow each application through our hiring process.">
        <Link to="/portal/positions" className="btn btn-outline">
          Apply for another role
        </Link>
      </PortalHeading>
      {error && <div className="form-error">{error}</div>}
      {applications?.length === 0 && (
        <p className={styles.empty}>
          No applications yet. <Link to="/portal/positions">Browse open positions</Link>.
        </p>
      )}
      {applications?.map((a) => (
        <section key={a.id} className={styles.card}>
          <div className={styles.itemHead}>
            <h2 className={styles.itemTitle}>{a.position_title}</h2>
            <StatusPill status={a.status} label={a.status_label} />
          </div>
          <div style={{ margin: '20px 0 8px' }}>
            <HiringSteps current={a.status === 'rejected' ? undefined : a.stage} compact />
          </div>
          {a.status === 'in_progress' && <p className={styles.itemText}>Next: {NEXT[a.stage]}</p>}
          {a.admin_note && <div className={styles.note}>{a.admin_note}</div>}
          <div className={styles.itemMeta}>
            <span>Applied {formatDate(a.created_at)}</span>
            <span>Last update {formatDate(a.updated_at)}</span>
            {a.id_verified && <span>✓ ID verified</span>}
          </div>
          {a.stage === 2 && a.status === 'in_progress' && (
            <div className={styles.itemActions}>
              <Link to="/portal/tests" className="btn btn-primary">
                Take the qualification test
              </Link>
            </div>
          )}
        </section>
      ))}
    </>
  )
}
