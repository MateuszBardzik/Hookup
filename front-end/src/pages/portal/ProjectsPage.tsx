/** /portal/projects — projects an admin added me to (admin pages → Projects → members). */
import { Link } from 'react-router-dom'
import { portalApi } from '../../api/portal'
import { money } from '../../features/portal/format'
import { PortalHeading } from '../../features/portal/PortalLayout'
import styles from '../../features/portal/Portal.module.css'
import { StatusPill } from '../../features/portal/StatusPill'
import { useLoad } from '../../features/portal/useLoad'

export function ProjectsPage() {
  const { data: projects, error } = useLoad(portalApi.projects)

  return (
    <>
      <PortalHeading title="Projects" subtitle="The projects you work on. New projects are added by our team." />
      {error && <div className="form-error">{error}</div>}
      {projects?.length === 0 && (
        <p className={styles.empty}>No projects yet. Once you reach the Project work step, your projects appear here.</p>
      )}
      <div className={styles.grid2}>
        {projects?.map((p) => (
          <section key={p.id} className={styles.card}>
            <div className={styles.itemHead}>
              <h2 className={styles.itemTitle}>{p.name}</h2>
              <StatusPill status={p.status} label={p.status_label} />
            </div>
            {p.description && <p className={styles.itemText}>{p.description}</p>}
            <div className={styles.itemMeta}>
              <span>{money(p.pay_per_task)} / task</span>
              <span>{p.my_open_tasks} open tasks</span>
              <span>{p.my_done_tasks} approved</span>
            </div>
            {p.my_open_tasks > 0 && (
              <div className={styles.itemActions}>
                <Link to="/portal/tasks" className="btn btn-primary">
                  Go to my tasks
                </Link>
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  )
}
