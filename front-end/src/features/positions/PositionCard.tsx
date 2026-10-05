// One card on the Careers page: icon, title, outline, check list (highlights), pay / type / location,
// "View details" (opens the popup) and "Apply now" (opens the Apply page).
// In the portal, `applied` replaces "Apply now" with a link to the applicant's progress.
// Top-right circle: green = active (qualification test link set on the admin pages), grey = not active yet.
import { Link } from 'react-router-dom'
import { CategoryIcon } from '../../components/icons'
import type { Position } from '../../types'
import { ApplyButton } from './ApplyButton'
import { PositionMeta } from './PositionMeta'
import styles from './Positions.module.css'

interface Props {
  position: Position
  onOpen: () => void
  applied?: boolean
}

export function PositionCard({ position, onOpen, applied = false }: Props) {
  return (
    <article className={styles.card}>
      <ActiveDot active={position.is_active} />
      <span className="icon-badge">
        <CategoryIcon category={position.category} />
      </span>
      <h3 className={styles.cardTitle}>{position.title}</h3>
      <p className={styles.outline}>{position.outline}</p>
      {position.highlights.length > 0 && (
        <ul className="check-list">
          {position.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
      <PositionMeta position={position} withCountries={false} />
      <div className={styles.cardFooter}>
        <button className={styles.more} onClick={onOpen}>
          View details
        </button>
        {applied ? <AppliedLink /> : <ApplyButton positionId={position.id} />}
      </div>
    </article>
  )
}

/** Small circle on the card's top-right corner: green = active, grey outline = not active yet. */
function ActiveDot({ active }: { active: boolean }) {
  const label = active ? 'Active — accepting applications' : 'Not active yet — the qualification test is not ready'
  return (
    <span className={`${styles.activeDot} ${active ? styles.isActive : ''}`} role="img" aria-label={label} title={label} />
  )
}

/** Shown instead of "Apply now" when the user already applied. */
export function AppliedLink() {
  return (
    <Link to="/portal/applications" className="btn btn-outline" title="You applied — view your progress">
      Applied ✓
    </Link>
  )
}
