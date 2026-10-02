/** /portal/payments — approved tasks and the total earned. Pending = submitted, waiting for review. */
import { portalApi } from '../../api/portal'
import { formatDate, money } from '../../features/portal/format'
import { PortalHeading } from '../../features/portal/PortalLayout'
import styles from '../../features/portal/Portal.module.css'
import { useLoad } from '../../features/portal/useLoad'

export function PaymentsPage() {
  const { data: tasks, error } = useLoad(portalApi.tasks)
  const approved = tasks?.filter((t) => t.status === 'approved') ?? []
  const pending = tasks?.filter((t) => t.status === 'submitted') ?? []
  const sum = (list: typeof approved) => list.reduce((total, t) => total + Number(t.amount), 0)

  return (
    <>
      <PortalHeading title="Payments" subtitle="Earnings from your approved tasks." />
      {error && <div className="form-error">{error}</div>}
      <div className={styles.stats} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className={styles.card}>
          <div className={styles.statLabel}>Total earned</div>
          <div className={styles.statValue}>{money(sum(approved))}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.statLabel}>Waiting for review</div>
          <div className={styles.statValue}>{money(sum(pending))}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.statLabel}>Approved tasks</div>
          <div className={styles.statValue}>{approved.length}</div>
        </div>
      </div>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Approved tasks</h2>
        {tasks && approved.length === 0 ? (
          <p className={styles.empty}>No approved tasks yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((t) => (
                  <tr key={t.id}>
                    <td>{formatDate(t.reviewed_at)}</td>
                    <td>{t.title}</td>
                    <td>{t.project_name}</td>
                    <td>{money(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
