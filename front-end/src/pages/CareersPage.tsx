// /careers — open positions (cards + details popup), required skills, hiring process, "Ready to get started?".
// Positions come from the database (admin pages → Positions); other text from config/site.ts → careers.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { positionsApi } from '../api/positions'
import { FeatureIcon } from '../components/icons'
import { PageHero } from '../components/PageHero'
import { SectionHeading } from '../components/SectionHeading'
import { site } from '../config/site'
import { HiringProcess } from '../features/landing/HiringProcess'
import styles from '../features/pages/Pages.module.css'
import { PositionCard } from '../features/positions/PositionCard'
import { PositionDialog } from '../features/positions/PositionDialog'
import positionStyles from '../features/positions/Positions.module.css'
import type { Position } from '../types'

export function CareersPage() {
  const c = site.careers
  const [positions, setPositions] = useState<Position[] | null>(null)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)

  useEffect(() => {
    positionsApi
      .list()
      .then(setPositions)
      .catch(() => setError('Could not load positions. Please try again later.'))
  }, [])

  const open = positions?.find((p) => p.id === openId)

  return (
    <div className={`container ${styles.page}`}>
      <PageHero title={c.title} subtitle={c.subtitle} crumb="Careers">
        <a href="#positions" className="btn btn-light">
          See open positions
        </a>
      </PageHero>

      <section id="positions" className="panel" aria-labelledby="positions-heading">
        <SectionHeading title={c.positionsTitle} id="positions-heading" />
        {error && <div className="form-error">{error}</div>}
        {positions === null ? (
          !error && <p className={styles.empty}>Loading…</p>
        ) : positions.length === 0 ? (
          <p className={styles.empty}>No open positions right now. Please check back soon.</p>
        ) : (
          <div className={positionStyles.grid}>
            {positions.map((p) => (
              <PositionCard key={p.id} position={p} onOpen={() => setOpenId(p.id)} />
            ))}
          </div>
        )}
      </section>

      <section className="panel" aria-labelledby="skills-heading">
        <SectionHeading title={c.skillsTitle} id="skills-heading" />
        <div className={styles.skills}>
          {c.skills.map((s) => (
            <div key={s.title} className={styles.skill}>
              <span className="icon-badge">
                <FeatureIcon icon={s.icon} />
              </span>
              {s.title}
            </div>
          ))}
        </div>
      </section>

      <HiringProcess />

      <section className={`panel ${styles.cta}`} aria-labelledby="cta-heading">
        <h2 id="cta-heading">{c.ctaTitle}</h2>
        <p>{c.ctaText}</p>
        <Link to="/apply" className="btn btn-primary">
          Apply now
        </Link>
      </section>

      {open && <PositionDialog position={open} onClose={() => setOpenId(null)} />}
    </div>
  )
}
