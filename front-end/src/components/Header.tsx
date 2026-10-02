/**
 * Top bar with the navigation (links from config/site.ts → nav).
 *   Logged out: nav links, Login, "Join our team" (opens the login / sign-up dialogs)
 *   Logged in:  nav links, Dashboard, user-name menu (Dashboard, Profile, Log out)
 * On small screens the links fold into a ☰ menu.
 */
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { site } from '../config/site'
import { useAuthDialog } from '../features/auth/useAuthDialog'
import { CloseIcon, MenuIcon } from './icons'
import styles from './Header.module.css'

export function Header() {
  const { user, loading } = useAuth()
  const { openAuthDialog } = useAuthDialog()
  const { pathname } = useLocation()
  // The mobile menu remembers the page it was opened on, so it closes by itself on navigation.
  const [menuPage, setMenuPage] = useState<string | null>(null)
  const menuOpen = menuPage === pathname
  const setMenuOpen = (open: boolean) => setMenuPage(open ? pathname : null)

  const links = site.nav.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) => `${styles.link} ${isActive && !item.to.includes('#') ? styles.active : ''}`}
    >
      {item.label}
    </NavLink>
  ))

  const actions = loading ? null : user ? (
    <>
      <Link to="/portal" className={`btn btn-primary ${styles.hideSmall}`}>
        Dashboard
      </Link>
      <UserMenu />
    </>
  ) : (
    <>
      <button className="btn btn-link" onClick={() => openAuthDialog('login')}>
        Login
      </button>
      <button className="btn btn-primary" onClick={() => openAuthDialog('signup')}>
        {site.joinCta}
      </button>
    </>
  )

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          <img src={site.logo} alt="" width={30} height={30} />
          <span>{site.name}</span>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {links}
        </nav>

        <div className={styles.actions}>
          <div className={styles.desktopActions}>{actions}</div>
          <button
            className={styles.menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav} aria-label="Main">
            {links}
          </nav>
          <div className={styles.mobileActions}>
            {!loading &&
              (user ? (
                <Link to="/portal" className="btn btn-primary">
                  Dashboard
                </Link>
              ) : (
                <>
                  <button className="btn btn-outline" onClick={() => openAuthDialog('login')}>
                    Login
                  </button>
                  <button className="btn btn-primary" onClick={() => openAuthDialog('signup')}>
                    {site.joinCta}
                  </button>
                </>
              ))}
          </div>
        </div>
      )}
    </header>
  )
}

function UserMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close the menu when clicking anywhere else.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!user) return null
  const name = `${user.first_name} ${user.last_name}`.trim() || user.email

  async function handleLogout() {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <div className={styles.menuWrap} ref={ref}>
      <button className={styles.userButton} onClick={() => setOpen(!open)} aria-expanded={open}>
        {user.photo ? (
          <img src={user.photo} alt="" className={styles.avatar} />
        ) : (
          <span className={styles.avatar}>{name[0]?.toUpperCase()}</span>
        )}
        <span className={styles.userName}>{name}</span>
        <span aria-hidden>▾</span>
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <Link to="/portal" role="menuitem" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link to="/portal/profile" role="menuitem" onClick={() => setOpen(false)}>
            Profile
          </Link>
          <button role="menuitem" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
