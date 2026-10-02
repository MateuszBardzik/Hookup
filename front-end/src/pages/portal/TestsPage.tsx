/**
 * /portal/tests — qualification tests: one per position applied to. Each position has its own
 * Google Form (admin pages → Positions → test_form_url). A test is open while the application is
 * at step 2 "Qualification test", which is where it lands right after applying.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { positionsApi } from '../../api/positions'
import { ApplyTestDialog } from '../../features/positions/ApplyTestDialog'
import { PortalHeading } from '../../features/portal/PortalLayout'
import styles from '../../features/portal/Portal.module.css'
import { useLoad } from '../../features/portal/useLoad'
import type { Application } from '../../types'

export function TestsPage() {
  const { data: applications, error } = useLoad(positionsApi.myApplications)
  const [open, setOpen] = useState<Application | null>(null)

  return (
    <>
      <PortalHeading title="Qualification tests" subtitle="A short test for each position you applied to (hiring step 2)." />
      {error && <div className="form-error">{error}</div>}
      {applications?.length === 0 && (
        <p className={styles.empty}>
          Apply to a position first. <Link to="/portal/positions">Browse open positions</Link>.
        </p>
      )}
      <div className={styles.grid2}>
        {applications?.map((a) => {
          const state = a.status !== 'in_progress' ? 'closed' : a.stage < 2 ? 'waiting' : a.stage === 2 ? 'open' : 'passed'
          return (
            <section key={a.id} className={styles.card}>
              <div className={styles.itemHead}>
                <h2 className={styles.itemTitle}>{a.position_title}</h2>
                <span className={state === 'open' ? styles.pill : state === 'passed' ? styles.pillGood : styles.pillMuted}>
                  {{ open: 'Ready to take', passed: 'Passed', waiting: 'Not open yet', closed: a.status_label }[state]}
                </span>
              </div>
              <p className={styles.itemText}>
                {state === 'open'
                  ? 'Your test is ready. It takes about 30 minutes; take it when you have time to focus.'
                  : state === 'passed'
                    ? 'You passed this test. Well done!'
                    : state === 'waiting'
                      ? 'The test opens here when your application reaches this step.'
                      : 'This application is closed.'}
              </p>
              {state === 'open' && (
                <div className={styles.itemActions}>
                  <button className="btn btn-primary" onClick={() => setOpen(a)}>
                    Open the test
                  </button>
                </div>
              )}
            </section>
          )
        })}
      </div>
      {open && <ApplyTestDialog application={open} onClose={() => setOpen(null)} />}
    </>
  )
}
