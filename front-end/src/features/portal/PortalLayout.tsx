/**
 * Frame of the worker portal (/portal/...): dark sidebar with the menu on the left,
 * top bar with the user's name, and the page on the right. Login required (see App.tsx).
 * Menu items: PORTAL_MENU below. On small screens the sidebar slides in from the ☰ button.
 */
import { useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import {
  BookIcon,
  BriefcaseIcon,
  ClipboardIcon,
  CloseIcon,
  FolderIcon,
  GridIcon,
  ListCheckIcon,
  LogoutIcon,
  MenuIcon,
  StepsIcon,
  UserIcon,
  WalletIcon,
} from '../../components/icons'
import { ScrollToTop } from '../../components/Layout'
import { site } from '../../config/site'
import styles from './Portal.module.css'

const PORTAL_MENU: { to: string; label: string; icon: ReactNode }[] = [
  { to: '/portal', label: 'Dashboard', icon: <GridIcon /> },
  { to: '/portal/positions', label: 'Open positions', icon: <BriefcaseIcon size={20} /> },
  { to: '/portal/applications', label: 'My applications', icon: <StepsIcon /> },
  { to: '/portal/training', label: 'Training', icon: <BookIcon /> },
  { to: '/portal/tests', label: 'Qualification tests', icon: <ClipboardIcon /> },
  { to: '/portal/projects', label: 'Projects', icon: <FolderIcon /> },
  { to: '/portal/tasks', label: 'My tasks', icon: <ListCheckIcon /> },
  { to: '/portal/payments', label: 'Payments', icon: <WalletIcon /> },
  { to: '/portal/profile', label: 'Profile', icon: <UserIcon /> },
]

export function PortalLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // The sidebar (small screens) remembers the page it was opened on, so it closes on navigation.
  const [openPage, setOpenPage] = useState<string | null>(null)
  const open = openPage === pathname
  const setOpen = (value: boolean) => setOpenPage(value ? pathname : null)

  async function logout() {
    await signOut()
    navigate('/')
  }

  const name = user ? `${user.first_name} ${user.last_name}`.trim() || user.email : ''

  return (
    <div className={styles.shell}>
      <ScrollToTop />
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <Link to="/" className={styles.brand}>
          <img src={site.logo} alt="" width={44} height={32} />
          <span>{site.name}</span>
        </Link>
        <p className={styles.sideTitle}>{site.portalTitle}</p>
        <nav className={styles.menu} aria-label="Portal">
          {PORTAL_MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/portal'}
              className={({ isActive }) => `${styles.menuItem} ${isActive ? styles.menuActive : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sideBottom}>
          <Link to="/" className={styles.menuItem}>
            ← Back to website
          </Link>
          <button className={styles.menuItem} onClick={logout}>
            <LogoutIcon />
            Log out
          </button>
        </div>
      </aside>
      {open && <div className={styles.scrim} onClick={() => setOpen(false)} aria-hidden />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
          <Link to="/portal/profile" className={styles.me}>
            {user?.photo ? <img src={user.photo} alt="" className={styles.avatar} /> : <span className={styles.avatar}>{name[0]?.toUpperCase()}</span>}
            <span className={styles.meName}>{name}</span>
          </Link>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/** Page title + optional line under it, used at the top of every portal page. */
export function PortalHeading({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className={styles.heading}>
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
