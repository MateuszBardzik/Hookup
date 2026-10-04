/** Dark "Join as an Expert" banner (landing page). Text: config/site.ts → joinBanner. Button → Careers page. */
import { Link } from 'react-router-dom'
import { site } from '../../config/site'
import styles from './Sections.module.css'

export function JoinBanner() {
  const { title, text, cta } = site.joinBanner
  return (
    <section className={styles.banner} aria-labelledby="join-heading">
      <div>
        <h2 id="join-heading">{title}</h2>
        <p>{text}</p>
      </div>
      <Link to="/careers" className="btn btn-light">
        {cta} →
      </Link>
    </section>
  )
}
