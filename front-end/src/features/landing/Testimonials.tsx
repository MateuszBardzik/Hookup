/**
 * Landing page: "What vendors and users say" (heading text: src/config/site.ts → feedbackSection).
 * Rows come from the `testimonials_testimonial` table (edit with your DB tool).
 * The whole section is hidden when there are no active rows.
 */
import { useEffect, useState } from 'react'
import { testimonialsApi } from '../../api/testimonials'
import { site } from '../../config/site'
import type { Testimonial } from '../../types'
import styles from './Testimonials.module.css'

const KIND_LABEL = { vendor: 'Vendor', user: 'User' }

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([])

  useEffect(() => {
    testimonialsApi
      .list()
      .then(setItems)
      .catch(() => setItems([])) // on error just don't show the section
  }, [])

  if (items.length === 0) return null

  return (
    <section className="band band-white" aria-labelledby="feedback-heading">
      <div className="container">
      <div className={styles.head}>
        <span className="eyebrow">{site.feedbackSection.badge}</span>
        <h2 id="feedback-heading" className={styles.heading}>
          {site.feedbackSection.title}
        </h2>
      </div>
      <div className={styles.grid}>
        {items.map((t) => (
          <TestimonialCard key={t.id} item={t} />
        ))}
      </div>
      </div>
    </section>
  )
}

function TestimonialCard({ item }: { item: Testimonial }) {
  // "Product Manager, Acme Inc." / "PCB Designer" / "Acme Inc."
  const subtitle = [item.author_title, item.organization].filter(Boolean).join(', ')

  return (
    <figure className={styles.card}>
      <span className={`${styles.badge} ${styles[item.kind]}`}>{KIND_LABEL[item.kind]}</span>
      <blockquote className={styles.quote}>“{item.quote}”</blockquote>
      <figcaption className={styles.author}>
        {item.photo ? (
          <img className={styles.avatar} src={item.photo} alt="" />
        ) : (
          <span className={styles.avatar}>{item.author_name[0]?.toUpperCase()}</span>
        )}
        <span>
          <span className={styles.name}>{item.author_name}</span>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </span>
      </figcaption>
    </figure>
  )
}
