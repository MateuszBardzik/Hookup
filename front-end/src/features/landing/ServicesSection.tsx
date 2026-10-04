/**
 * Landing page: "What we do" — four connected cards and one link under them (to the Services page).
 * Text: config/site.ts → servicesSection, services.
 */
import { Link } from 'react-router-dom'
import { CategoryIcon } from '../../components/icons'
import { SectionHeading } from '../../components/SectionHeading'
import { site } from '../../config/site'
import styles from './Sections.module.css'

export function ServicesSection() {
  const { badge, title, subtitle, cta } = site.servicesSection
  return (
    <section className="panel" aria-labelledby="services-heading">
      <SectionHeading eyebrow={badge} title={title} subtitle={subtitle} id="services-heading" />
      <div className={styles.serviceGrid}>
        {site.services.map((s) => (
          <article key={s.id} className={styles.serviceCard}>
            <span className="icon-badge">
              <CategoryIcon category={s.icon} />
            </span>
            <h3 className={styles.cardTitle}>{s.title}</h3>
            <p className={styles.cardText}>{s.text}</p>
          </article>
        ))}
      </div>
      {cta?.label && (
        <Link className={styles.servicesCta} to={cta.to}>
          {cta.label} <span aria-hidden>→</span>
        </Link>
      )}
    </section>
  )
}
