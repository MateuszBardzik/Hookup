// Page footer: logo + tagline, the same links as the navigation bar, social links, copyright.
// Links and social URLs: config/site.ts (nav, social).
import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { ChatIcon, LinkedInIcon, XIcon } from './icons'
import styles from './Footer.module.css'

const SOCIAL = [
  { key: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon />, url: site.social.linkedin },
  { key: 'x', label: 'X', icon: <XIcon />, url: site.social.x },
  { key: 'discord', label: 'Discord', icon: <ChatIcon />, url: site.social.discord },
].filter((s) => s.url)

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandCol}>
          <div className={styles.brand}>
            <img src={site.logo} alt="" width={26} height={26} />
            <span>{site.name}</span>
          </div>
          <p className={styles.text}>{site.footerText}</p>
        </div>

        <nav className={styles.links} aria-label="Footer">
          {site.nav.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        {SOCIAL.length > 0 && (
          <div className={styles.social}>
            {SOCIAL.map((s) => (
              <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        )}
      </div>
      <p className={`container ${styles.copy}`}>
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </p>
    </footer>
  )
}
