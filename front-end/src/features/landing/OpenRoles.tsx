/**
 * Landing page: "open roles" section — a full-width dark band laid out like an editorial index.
 *   left:  eyebrow + big serif headline + subtitle   (text: src/config/site.ts → rolesSection)
 *          category tabs that filter the list          (from each position's `category`)
 *   right: numbered list  01  KiCAD Expert · PCB design · Remote · countries   $200 per task  →
 *          (rows come from the positions table; only the first `rolesSection.maxShown`, default 3)
 * Clicking a row or "View all roles" → Careers page (/careers).
 * Hidden when there are no active positions.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { positionsApi } from '../../api/positions'
import { ArrowIcon } from '../../components/icons'
import { site } from '../../config/site'
import type { Position } from '../../types'
import styles from './OpenRoles.module.css'

const ALL = 'all'

export function OpenRoles() {
  const navigate = useNavigate()

  const [positions, setPositions] = useState<Position[]>([])
  const [category, setCategory] = useState<string>(ALL)

  useEffect(() => {
    positionsApi
      .list()
      .then(setPositions)
      .catch(() => setPositions([]))
  }, [])

  if (positions.length === 0) return null

  // Tabs: one per category that actually has positions, in first-seen order.
  const categories = [...new Map(positions.map((p) => [p.category, p.category_label])).entries()]
  const visible = category === ALL ? positions : positions.filter((p) => p.category === category)

  const { badge, title, subtitle, viewAll, maxShown } = site.rolesSection
  const shown = visible.slice(0, maxShown)
  const more = visible.length - shown.length
  const goToRoles = () => navigate('/careers')

  return (
    <section id="roles" className="band band-dark" aria-labelledby="roles-heading">
      <div className={`container ${styles.section}`}>
        <div className={styles.intro}>
          <span className="eyebrow">{badge}</span>
          <h2 id="roles-heading" className={styles.title}>
            {title}
          </h2>
          <p className={styles.subtitle}>{subtitle}</p>

          {categories.length > 1 && (
            <div className={styles.tabs} role="tablist" aria-label="Filter roles by category">
              {[[ALL, 'All roles'] as const, ...categories].map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={category === key}
                  className={`${styles.tab} ${category === key ? styles.tabActive : ''}`}
                  onClick={() => setCategory(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <button className={styles.viewAll} onClick={goToRoles}>
            {viewAll} ({positions.length}) <span aria-hidden>→</span>
          </button>
        </div>

        <div>
          <ol className={styles.list}>
            {shown.map((p, i) => (
              <li key={p.id}>
                <RoleRow position={p} number={i + 1} onOpen={goToRoles} />
              </li>
            ))}
          </ol>
          {more > 0 && (
            <button className={styles.moreRoles} onClick={goToRoles}>
              + {more} more {more === 1 ? 'role' : 'roles'} — see all on the Careers page →
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

function RoleRow({ position, number, onOpen }: { position: Position; number: number; onOpen: () => void }) {
  const meta = [position.category_label, position.location || 'Remote', position.countries].filter(Boolean)

  return (
    <button className={styles.row} onClick={onOpen}>
      <span className={styles.number}>{String(number).padStart(2, '0')}</span>
      <span className={styles.main}>
        <span className={styles.rowTitle}>{position.title}</span>
        <span className={styles.meta}>{meta.join(' · ')}</span>
      </span>
      {position.pay && <span className={styles.pay}>{position.pay}</span>}
      <span className={styles.arrow} aria-hidden>
        <ArrowIcon diagonal />
      </span>
    </button>
  )
}
