/**
 * Landing page hero, split in two:
 *   left  (cream): eyebrow, big serif headline, subtitle, two buttons, fact list
 *   right:         hero picture, its edges fading into the page. The picture stays still; small
 *                  parts of it move (HeroEffects.tsx) and the whole section behind it has a moving
 *                  background (HeroBackdrop.tsx). Both are off for visitors who prefer reduced motion.
 * All text and the image are set in src/config/site.ts → hero.
 *   "Join our team"     logged out → Sign-up dialog, logged in → Careers page
 *   "See open roles"    scrolls to the open-roles section
 */
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { site } from '../../config/site'
import { useAuthDialog } from '../auth/useAuthDialog'
import { HeroEffects } from './HeroEffects'
import styles from './Landing.module.css'

export function Hero() {
  const { eyebrow, title, highlight, subtitle, primaryCta, secondaryCta, chips, image, alt, status, caption } =
    site.hero
  const { user } = useAuth()
  const { openAuthDialog } = useAuthDialog()
  const navigate = useNavigate()

  // Split the title so the highlighted words are set in italics (highlight colour).
  const i = highlight ? title.indexOf(highlight) : -1
  const heading =
    i >= 0 ? (
      <>
        {title.slice(0, i)}
        <em className={styles.highlight}>{highlight}</em>
        {title.slice(i + highlight.length)}
      </>
    ) : (
      title
    )

  const join = () => (user ? navigate('/careers') : openAuthDialog('signup'))
  const seeRoles = () => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.heroText}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 id="hero-heading" className={styles.title}>
          {heading}
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>

        <div className={styles.actions}>
          <button className={`btn btn-primary ${styles.cta}`} onClick={join}>
            {primaryCta} <span aria-hidden>→</span>
          </button>
          <button className={`btn btn-outline ${styles.cta}`} onClick={seeRoles}>
            {secondaryCta}
          </button>
        </div>

        {chips.length > 0 && (
          <ul className={styles.chips}>
            {chips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.heroArt}>
        <div className={styles.artCard}>
          <img src={image} alt={alt} data-hero-picture />
          <HeroEffects />
        </div>
        {status && (
          <span className={styles.status}>
            <span className={styles.pulse} aria-hidden />
            {status}
          </span>
        )}
        {caption && <p className={styles.caption}>{caption}</p>}
      </div>
    </section>
  )
}

