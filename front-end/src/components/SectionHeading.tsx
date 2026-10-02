// Eyebrow + serif heading + optional subtitle, used at the top of most sections.
import styles from './SectionHeading.module.css'

interface Props {
  eyebrow?: string
  title: string
  subtitle?: string
  id?: string // id of the <h2>, for aria-labelledby
  center?: boolean
}

export function SectionHeading({ eyebrow, title, subtitle, id, center }: Props) {
  return (
    <div className={`${styles.head} ${center ? styles.center : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  )
}
