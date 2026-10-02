/**
 * "Login with Google" using Google Identity Services.
 * Google draws the button itself (their branding rules). When clicked, Google
 * gives us a signed ID token ("credential") which we send to our back-end.
 *
 * Needs GOOGLE_CLIENT_ID in back-end/.env. Without it the button is hidden
 * (in development a disabled placeholder is shown instead).
 */
import { useEffect, useRef, useState } from 'react'
import { authApi } from '../../api/auth'
import { ApiError } from '../../api/client'
import type { AuthResponse } from '../../types'
import styles from './AuthForms.module.css'
import { getAuthConfig, loadScript } from './socialConfig'

// Minimal typing for the part of Google's SDK we use.
interface GoogleSdk {
  accounts: {
    id: {
      initialize: (opts: { client_id: string; callback: (r: { credential: string }) => void }) => void
      renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void
    }
  }
}

interface Props {
  onSuccess: (res: AuthResponse) => void
  onError: (message: string) => void
}

export function GoogleButton({ onSuccess, onError }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [clientId, setClientId] = useState<string | null>(null) // null = still loading

  // Keep the latest callbacks without re-drawing Google's button every render.
  const callbacks = useRef({ onSuccess, onError })
  useEffect(() => {
    callbacks.current = { onSuccess, onError }
  })

  useEffect(() => {
    getAuthConfig().then((cfg) => setClientId(cfg.google_client_id))
  }, [])

  useEffect(() => {
    if (!clientId || !ref.current) return
    const el = ref.current
    loadScript('https://accounts.google.com/gsi/client')
      .then(() => {
        const google = (window as unknown as { google: GoogleSdk }).google
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            try {
              callbacks.current.onSuccess(await authApi.google(credential))
            } catch (err) {
              callbacks.current.onError(err instanceof ApiError ? err.message : 'Google login failed.')
            }
          },
        })
        google.accounts.id.renderButton(el, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: Math.min(el.offsetWidth || 390, 400),
        })
      })
      .catch(() => callbacks.current.onError('Could not load Google login.'))
  }, [clientId])

  if (clientId === null) return null
  if (!clientId) return <NotConfigured label="Login with Google" envName="GOOGLE_CLIENT_ID" />
  return <div ref={ref} className={styles.socialButton} />
}

export function NotConfigured({ label, envName }: { label: string; envName: string }) {
  if (!import.meta.env.DEV) return null // hidden on the real site
  return (
    <div>
      <button type="button" className="btn btn-outline btn-block" disabled>
        {label}
      </button>
      <p className={styles.hint}>Set {envName} in back-end/.env to enable</p>
    </div>
  )
}
