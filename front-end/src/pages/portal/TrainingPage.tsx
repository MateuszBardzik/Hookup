/** /portal/training — training modules (admin pages → Training modules); "Mark as done" saves progress. */
import { portalApi } from '../../api/portal'
import { formatDate } from '../../features/portal/format'
import { PortalHeading } from '../../features/portal/PortalLayout'
import styles from '../../features/portal/Portal.module.css'
import { useLoad } from '../../features/portal/useLoad'

export function TrainingPage() {
  const { data: modules, error, reload } = useLoad(portalApi.training)
  const done = modules?.filter((m) => m.completed_at).length ?? 0

  async function markDone(id: number) {
    await portalApi.completeTraining(id)
    reload()
  }

  return (
    <>
      <PortalHeading
        title="Training"
        subtitle={modules ? `${done} of ${modules.length} modules completed` : 'Get ready for project work.'}
      />
      {error && <div className="form-error">{error}</div>}
      {modules?.length === 0 && <p className={styles.empty}>No training modules yet.</p>}
      <div className={styles.grid2}>
        {modules?.map((m, i) => (
          <section key={m.id} className={styles.card}>
            <div className={styles.itemHead}>
              <h2 className={styles.itemTitle}>
                {i + 1}. {m.title}
              </h2>
              {m.completed_at ? <span className={styles.pillGood}>Done</span> : <span className={styles.pillMuted}>To do</span>}
            </div>
            {m.description && <p className={styles.itemText}>{m.description}</p>}
            <div className={styles.itemMeta}>
              {m.duration && <span>{m.duration}</span>}
              {m.completed_at && <span>Completed {formatDate(m.completed_at)}</span>}
            </div>
            <div className={styles.itemActions}>
              {m.url && (
                <a className="btn btn-outline" href={m.url} target="_blank" rel="noopener noreferrer">
                  Open material ↗
                </a>
              )}
              {!m.completed_at && (
                <button className="btn btn-primary" onClick={() => markDone(m.id)}>
                  Mark as done
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
