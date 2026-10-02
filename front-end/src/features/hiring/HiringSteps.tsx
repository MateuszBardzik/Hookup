/**
 * The 5 hiring steps (text: config/site.ts → hiringSteps):
 *   1 Apply → 2 Qualification test → 3 ID verification → 4 Training → 5 Project work
 * Without `current`: plain explanation (landing + Careers page).
 * With `current` (1-5): progress for one application (portal) — done steps get a ✓.
 */
import { CheckIcon } from '../../components/icons'
import { site } from '../../config/site'
import styles from './HiringSteps.module.css'

interface Props {
  current?: number
  compact?: boolean // smaller version for the portal
}

export function HiringSteps({ current, compact }: Props) {
  return (
    <ol className={`${styles.steps} ${compact ? styles.compact : ''}`}>
      {site.hiringSteps.map((step, i) => {
        const n = i + 1
        const state = current === undefined ? 'plain' : n < current ? 'done' : n === current ? 'current' : 'todo'
        return (
          <li key={step.title} className={`${styles.step} ${styles[state]}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className={styles.circle}>{state === 'done' ? <CheckIcon size={18} /> : n}</span>
            <span className={styles.title}>{step.title}</span>
            {!compact && <span className={styles.text}>{step.text}</span>}
          </li>
        )
      })}
    </ol>
  )
}
