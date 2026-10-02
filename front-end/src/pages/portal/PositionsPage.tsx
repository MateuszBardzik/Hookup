/**
 * /portal/positions — all open positions inside the worker portal (same cards and details popup
 * as the Careers page). Positions already applied to show "Applied ✓ View progress".
 */
import { useCallback, useState } from 'react'
import { positionsApi } from '../../api/positions'
import { PortalHeading } from '../../features/portal/PortalLayout'
import styles from '../../features/portal/Portal.module.css'
import { useLoad } from '../../features/portal/useLoad'
import { PositionCard } from '../../features/positions/PositionCard'
import { PositionDialog } from '../../features/positions/PositionDialog'
import positionStyles from '../../features/positions/Positions.module.css'

export function PortalPositionsPage() {
  const load = useCallback(() => Promise.all([positionsApi.list(), positionsApi.myApplications()]), [])
  const { data, error } = useLoad(load)
  const [openId, setOpenId] = useState<number | null>(null)

  const [positions, applications] = data ?? [null, []]
  const applied = new Set(applications.map((a) => a.position))
  const open = positions?.find((p) => p.id === openId)

  return (
    <>
      <PortalHeading
        title="Open positions"
        subtitle={positions ? `${positions.length} roles open now. Apply to as many as fit your skills.` : 'Explore all roles.'}
      />
      {error && <div className="form-error">{error}</div>}
      {positions?.length === 0 && <p className={styles.empty}>No open positions right now. Please check back soon.</p>}
      {positions && positions.length > 0 && (
        <div className={positionStyles.grid}>
          {positions.map((p) => (
            <PositionCard key={p.id} position={p} applied={applied.has(p.id)} onOpen={() => setOpenId(p.id)} />
          ))}
        </div>
      )}
      {open && <PositionDialog position={open} applied={applied.has(open.id)} onClose={() => setOpenId(null)} />}
    </>
  )
}
