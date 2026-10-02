/**
 * /portal — dashboard: welcome, status of the latest application, 4 numbers
 * (projects, assigned tasks, completed this week, earnings), quick links and recent activity.
 */
import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { portalApi } from '../../api/portal'
import { positionsApi } from '../../api/positions'
import { useAuth } from '../../auth/useAuth'
import {
  BookIcon,
  CheckIcon,
  ChevronIcon,
  ClipboardIcon,
  ClockIcon,
  CloseIcon,
  FolderIcon,
  ListCheckIcon,
  StepsIcon,
  WalletIcon,
} from '../../components/icons'
import { money, timeAgo } from '../../features/portal/format'
import { PortalHeading } from '../../features/portal/PortalLayout'
import styles from '../../features/portal/Portal.module.css'
import { useLoad } from '../../features/portal/useLoad'
import type { Application, PortalSummary } from '../../types'

export function DashboardPage() {
  const { user } = useAuth()
  const load = useCallback(() => Promise.all([portalApi.summary(), positionsApi.myApplications()]), [])
  const { data, error } = useLoad(load)
  const [summary, applications] = data ?? [null, []]

  return (
    <>
      <PortalHeading title={`Welcome back${user?.first_name ? `, ${user.first_name}` : ''}!`} subtitle="Here's your current activity and progress." />
      {error && <div className="form-error">{error}</div>}
      {data && (
        <>
          <ApplicationBanner applications={applications} />
          <Stats summary={summary!} />
          <div className={styles.twoCols}>
            <QuickLinks applications={applications} />
            <RecentActivity summary={summary!} />
          </div>
        </>
      )}
    </>
  )
}

function ApplicationBanner({ applications }: { applications: Application[] }) {
  const latest = applications[0]
  if (!latest) {
    return (
      <div className={styles.banner}>
        <span>You haven't applied to a position yet.</span>
        <Link to="/portal/positions">View open positions →</Link>
      </div>
    )
  }
  const good = latest.status === 'in_progress'
  return (
    <div className={`${styles.banner} ${good ? styles.bannerGood : ''}`}>
      <span>
        <strong>{latest.position_title}</strong> — step {latest.stage} of 5: {latest.stage_label}
        {!good && ` (${latest.status_label})`}
      </span>
      <Link to="/portal/applications">View progress</Link>
    </div>
  )
}

function Stats({ summary }: { summary: PortalSummary }) {
  const s = summary.stats
  const items = [
    { label: 'Available projects', value: s.available_projects, icon: <FolderIcon /> },
    { label: 'Assigned tasks', value: s.assigned_tasks, icon: <ListCheckIcon /> },
    { label: 'Completed this week', value: s.completed_this_week, icon: <ClockIcon size={20} /> },
    { label: 'Earnings', value: money(s.earnings), icon: <WalletIcon /> },
  ]
  return (
    <div className={styles.stats}>
      {items.map((item) => (
        <div key={item.label} className={`${styles.card} ${styles.stat}`}>
          <span className="icon-badge">{item.icon}</span>
          <div>
            <div className={styles.statLabel}>{item.label}</div>
            <div className={styles.statValue}>{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Shortcuts; the one matching the latest application's step is marked "Next". */
function QuickLinks({ applications }: { applications: Application[] }) {
  const stage = applications.find((a) => a.status === 'in_progress')?.stage ?? 0
  const links = [
    { to: '/portal/applications', title: 'Track your application', text: 'See where you are in the hiring process', icon: <StepsIcon />, next: stage === 1 || stage === 3 },
    { to: '/portal/tests', title: 'Take the qualification test', text: 'Check your skills and get certified', icon: <ClipboardIcon />, next: stage === 2 },
    { to: '/portal/training', title: 'Start training', text: 'Complete your required training modules', icon: <BookIcon />, next: stage === 4 },
    { to: '/portal/projects', title: 'View your projects', text: 'Browse your projects and pick up new tasks', icon: <FolderIcon />, next: stage === 5 },
  ]
  if (!applications.length) links.unshift({ to: '/portal/positions', title: 'Apply for a position', text: 'Browse open roles and apply', icon: <StepsIcon />, next: true })

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Quick links</h2>
      <div className={styles.linkList}>
        {links.slice(0, 4).map((l) => (
          <Link key={l.to} to={l.to} className={styles.linkRow}>
            <span className="icon-badge">{l.icon}</span>
            <span>
              <span className={styles.linkTitle}>{l.title}</span>
              <span className={styles.linkText}>{l.text}</span>
            </span>
            {l.next && <span className={styles.nextBadge}>Next</span>}
            <ChevronIcon />
          </Link>
        ))}
      </div>
    </section>
  )
}

function RecentActivity({ summary }: { summary: PortalSummary }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Recent activity</h2>
      {summary.recent_activity.length === 0 ? (
        <p className={styles.empty}>Nothing yet. Your finished tasks and training will show up here.</p>
      ) : (
        <ul className={styles.activity}>
          {summary.recent_activity.map((e, i) => (
            <li key={i}>
              <span className={`${styles.dot} ${e.kind === 'task_rejected' ? styles.dotWarn : e.kind === 'application' || e.kind === 'task_submitted' ? styles.dotInfo : ''}`}>
                {e.kind === 'task_rejected' ? <CloseIcon size={14} /> : <CheckIcon size={14} />}
              </span>
              <span>
                <div className={styles.actTitle}>{e.title}</div>
                <div className={styles.actDetail}>{e.detail}</div>
              </span>
              <span className={styles.actTime}>{timeAgo(e.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
