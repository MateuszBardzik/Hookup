/**
 * /portal/tasks — my tasks, filtered by status. "Open task" goes to where the work is done;
 * "Mark as submitted" tells the team it's finished. Admins approve (→ Payments) or send back.
 */
import { useState } from 'react'
import { portalApi } from '../../api/portal'
import { formatDate, money } from '../../features/portal/format'
import { PortalHeading } from '../../features/portal/PortalLayout'
import styles from '../../features/portal/Portal.module.css'
import { StatusPill } from '../../features/portal/StatusPill'
import { useLoad } from '../../features/portal/useLoad'

const FILTERS = [
  { key: 'todo', label: 'To do', match: ['assigned', 'rejected'] },
  { key: 'submitted', label: 'Submitted', match: ['submitted'] },
  { key: 'approved', label: 'Approved', match: ['approved'] },
  { key: 'all', label: 'All', match: ['assigned', 'rejected', 'submitted', 'approved'] },
]

export function TasksPage() {
  const { data: tasks, error, reload } = useLoad(portalApi.tasks)
  const [filter, setFilter] = useState('todo')
  const active = FILTERS.find((f) => f.key === filter)!
  const shown = tasks?.filter((t) => active.match.includes(t.status)) ?? []

  async function submit(id: number) {
    await portalApi.submitTask(id)
    reload()
  }

  return (
    <>
      <PortalHeading title="My tasks" subtitle="Tasks assigned to you by our team." />
      {error && <div className="form-error">{error}</div>}
      <div className={styles.tabs} role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            className={`${styles.tab} ${filter === f.key ? styles.tabActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label} ({tasks?.filter((t) => f.match.includes(t.status)).length ?? 0})
          </button>
        ))}
      </div>
      {tasks && shown.length === 0 && <p className={styles.empty}>No tasks here.</p>}
      {shown.map((t) => (
        <section key={t.id} className={styles.card}>
          <div className={styles.itemHead}>
            <h2 className={styles.itemTitle}>{t.title}</h2>
            <StatusPill status={t.status} label={t.status === 'rejected' ? 'Sent back' : t.status_label} />
          </div>
          {t.instructions && <p className={styles.itemText}>{t.instructions}</p>}
          {t.review_note && <div className={styles.note}>{t.review_note}</div>}
          <div className={styles.itemMeta}>
            <span>{t.project_name}</span>
            <span>{money(t.amount)}</span>
            <span>Assigned {formatDate(t.assigned_at)}</span>
            {t.submitted_at && <span>Submitted {formatDate(t.submitted_at)}</span>}
          </div>
          {(t.status === 'assigned' || t.status === 'rejected' || t.link) && (
            <div className={styles.itemActions}>
              {t.link && (
                <a className="btn btn-outline" href={t.link} target="_blank" rel="noopener noreferrer">
                  Open task ↗
                </a>
              )}
              {(t.status === 'assigned' || t.status === 'rejected') && (
                <button className="btn btn-primary" onClick={() => submit(t.id)}>
                  Mark as submitted
                </button>
              )}
            </div>
          )}
        </section>
      ))}
    </>
  )
}
