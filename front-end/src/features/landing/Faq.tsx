/**
 * Landing page: "Frequently asked questions" (heading text: src/config/site.ts → faqSection).
 * Rows come from the `faqs_faq` table (edit with your DB tool).
 * Uses the browser's built-in <details>/<summary>, so it works with the
 * keyboard and screen readers without extra code. Hidden when there are no rows.
 */
import { useEffect, useState } from 'react'
import { faqsApi } from '../../api/faqs'
import { site } from '../../config/site'
import type { Faq as FaqItem } from '../../types'
import styles from './Faq.module.css'

export function Faq() {
  const [items, setItems] = useState<FaqItem[]>([])

  useEffect(() => {
    faqsApi
      .list()
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  if (items.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="faq-heading">
      <div className={styles.intro}>
        <span className="eyebrow">{site.faqSection.badge}</span>
        <h2 id="faq-heading" className={styles.heading}>
          {site.faqSection.title}
        </h2>
        <p className={styles.lead}>{site.faqSection.subtitle}</p>
      </div>

      <div className={styles.list}>
        {items.map((item) => (
          <details key={item.id} className={styles.item}>
            <summary className={styles.question}>
              <span>{item.question}</span>
              <span className={styles.toggle} aria-hidden />
            </summary>
            {/* white-space: pre-line keeps the line breaks typed in the database */}
            <p className={styles.answer}>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
