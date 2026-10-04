/**
 * Landing page: "Why your expertise matters" — numbered cards (icon, number, title, text) across the
 * full page width. Text and icons: config/site.ts → whySection, why.
 */
import { FeatureIcon } from '../../components/icons'
import { SectionHeading } from '../../components/SectionHeading'
import { site } from '../../config/site'
import styles from './Sections.module.css'

export function WhyUs() {
  return (
    <section className="panel" aria-labelledby="why-heading">
      <SectionHeading eyebrow={site.whySection.badge} title={site.whySection.title} id="why-heading" />
      <ol className={styles.whyGrid}>
        {site.why.map((item, i) => (
          <li key={item.title} className={styles.why}>
            <div className={styles.whyTop}>
              <span className={styles.whyIcon}>
                <FeatureIcon icon={item.icon} size={22} />
              </span>
              <span className={styles.whyNumber} aria-hidden>
                {i + 1}
              </span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
