/** Landing page: "Why work with us?" — 4 short reasons. Text: config/site.ts → why. */
import { FeatureIcon } from '../../components/icons'
import { SectionHeading } from '../../components/SectionHeading'
import { site } from '../../config/site'
import styles from './Sections.module.css'

export function WhyUs() {
  return (
    <section className="panel" aria-labelledby="why-heading">
      <SectionHeading eyebrow={site.whySection.badge} title={site.whySection.title} id="why-heading" center />
      <div className={styles.whyGrid}>
        {site.why.map((item) => (
          <div key={item.title} className={styles.why}>
            <span className="icon-badge">
              <FeatureIcon icon={item.icon} />
            </span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
