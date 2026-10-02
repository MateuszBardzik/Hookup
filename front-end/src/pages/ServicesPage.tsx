// /services — one section per service (text + pictures: config/site.ts → services).
import { Link } from 'react-router-dom'
import { CategoryIcon } from '../components/icons'
import { PageHero } from '../components/PageHero'
import { site } from '../config/site'
import styles from '../features/pages/Pages.module.css'

export function ServicesPage() {
  const { pageTitle, pageSubtitle } = site.servicesSection
  return (
    <div className={`container ${styles.page}`}>
      <PageHero title={pageTitle} subtitle={pageSubtitle} crumb="Services" />

      <section className="panel" aria-label="Services">
        {site.services.map((s) => (
          <article key={s.id} id={s.id} className={styles.serviceRow}>
            <img className={styles.illustration} src={s.image} alt="" />
            <div>
              <h2 className={styles.rowTitle}>
                <span className="icon-badge">
                  <CategoryIcon category={s.icon} />
                </span>
                {s.title}
              </h2>
              <p className={styles.rowText}>{s.details}</p>
              <ul className="check-list">
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <Link className={styles.rowLink} to="/careers">
                See open roles →
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
