// /about — mission, values, team and the "Contact us" form. Text: config/site.ts → about, contact.
import { FeatureIcon, MailIcon } from '../components/icons' // add PinIcon back if you show the location again
import { PageHero } from '../components/PageHero'
import { SectionHeading } from '../components/SectionHeading'
import { site } from '../config/site'
import { ContactForm } from '../features/pages/ContactForm'
import styles from '../features/pages/Pages.module.css'

export function AboutPage() {
  const a = site.about
  const c = site.contact
  return (
    <div className={`container ${styles.page}`}>
      <PageHero title={a.title} subtitle={a.subtitle} crumb="About" />

      <section className="panel" aria-labelledby="mission-heading">
        <div className={styles.split}>
          <div>
            <SectionHeading title={a.missionTitle} id="mission-heading" />
            <p>{a.mission}</p>
          </div>
          <figure style={{ margin: 0 }}>
            <img className={styles.illustration} src={a.missionImage} alt="" />
            <figcaption className={styles.caption}>{a.missionCaption}</figcaption>
          </figure>
        </div>
      </section>

      <section className="panel" aria-labelledby="values-heading">
        <SectionHeading title={a.valuesTitle} id="values-heading" center />
        <div className={styles.values}>
          {a.values.map((v) => (
            <div key={v.title} className={styles.value}>
              <span className="icon-badge">
                <FeatureIcon icon={v.icon} />
              </span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="team-heading">
        <div className={styles.split}>
          <div>
            <SectionHeading title={a.teamTitle} id="team-heading" />
            <p>{a.team}</p>
          </div>
          <img className={styles.illustration} src={a.teamImage} alt="" />
        </div>
      </section>

      <section id="contact" className={styles.contact} aria-labelledby="contact-heading">
        <div>
          <h2 id="contact-heading">{c.title}</h2>
          <p className={styles.contactText}>{c.text}</p>
          {c.email && (
            <p className={styles.contactLine}>
              <span className={styles.contactIcon}>
                <MailIcon />
              </span>
              <a href={`mailto:${c.email}`}>{c.email}</a>
            </p>
          )}
          {/* {c.location && (
            <p className={styles.contactLine}>
              <span className={styles.contactIcon}>
                <PinIcon size={20} />
              </span>
              {c.location}
            </p>
          )} */}
        </div>
        <ContactForm />
      </section>
    </div>
  )
}
