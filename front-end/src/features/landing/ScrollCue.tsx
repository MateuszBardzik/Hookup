/**
 * Small "Scroll to explore" cue at the bottom of the first screen, so visitors notice there is more
 * below the hero. Click → smooth scroll to the first section after it ([data-after-fold] on the
 * landing page). It fades out as soon as the page is scrolled. Text: config/site.ts → scrollCue.
 */
import { useEffect, useState } from 'react'
import { site } from '../../config/site'
import styles from './ScrollCue.module.css'

export function ScrollCue() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!site.scrollCue) return null

  const scrollDown = () =>
    document.querySelector('[data-after-fold]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <button
      type="button"
      className={`${styles.cue} ${hidden ? styles.hidden : ''}`}
      onClick={scrollDown}
      tabIndex={hidden ? -1 : 0}
    >
      <span className={styles.label}>{site.scrollCue}</span>
      <span className={styles.arrow} aria-hidden>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </span>
    </button>
  )
}
