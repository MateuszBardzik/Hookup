/**
 * Dark banner at the top of the inner pages (Services, Careers, About, Apply):
 * breadcrumb, big title, subtitle. Text comes from config/site.ts.
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './PageHero.module.css'

interface Props {
  title: string
  subtitle?: string
  crumb: string // last breadcrumb item, e.g. "Services"
  children?: ReactNode // optional buttons under the subtitle
}

export function PageHero({ title, subtitle, crumb, children }: Props) {
  return (
    <section className={styles.hero}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden>›</span>
        <span aria-current="page">{crumb}</span>
      </nav>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </section>
  )
}
