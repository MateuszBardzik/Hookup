// Page frame for the public pages: header on top, footer at the bottom.
// AuthDialogProvider lets any page open the Login / Sign-up dialog.
// ScrollToTop: new page -> top; link with #id (e.g. /about#contact) -> that section.
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AuthDialogProvider } from '../features/auth/AuthDialogProvider'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  return (
    <AuthDialogProvider>
      <ScrollToTop />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthDialogProvider>
  )
}

export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      // wait a moment for the page (and its data) to render
      const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 150)
      return () => clearTimeout(timer)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
