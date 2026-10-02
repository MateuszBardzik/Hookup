/**
 * /verify-email?uid=...&token=... — opened from the link in the sign-up email.
 * Verifies the address, logs the user in and offers the dashboard. If the link is invalid or
 * expired, the user can ask for a new one.
 */
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../auth/useAuth'
import { TextField } from '../components/TextField'
import { CheckEmail } from '../features/auth/CheckEmail'
import styles from '../features/pages/Pages.module.css'

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const { signIn } = useAuth()
  const [state, setState] = useState<'checking' | 'done' | 'failed'>('checking')
  const [email, setEmail] = useState('')
  const [askedFor, setAskedFor] = useState('')
  const started = useRef(false) // the link works once: don't send it twice (React dev mode runs effects twice)

  useEffect(() => {
    if (started.current) return
    started.current = true
    authApi
      .verifyEmail(params.get('uid') ?? '', params.get('token') ?? '')
      .then((res) => {
        signIn(res)
        setState('done')
      })
      .catch(() => setState('failed'))
  }, [params, signIn])

  return (
    <div className={`container ${styles.page}`}>
      <section className="panel" aria-live="polite">
        <div className={styles.done} style={{ maxWidth: 560, margin: '0 auto' }}>
          {state === 'checking' && <h1>Verifying your email…</h1>}

          {state === 'done' && (
            <>
              <h1>Email verified!</h1>
              <p>Thank you — your account is active and you're logged in.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                <Link to="/portal" className="btn btn-primary">
                  Go to my dashboard
                </Link>
                <Link to="/careers" className="btn btn-outline">
                  Browse open positions
                </Link>
              </div>
            </>
          )}

          {state === 'failed' && (
            <>
              <h1>This link doesn't work</h1>
              <p>It may have expired or been used already. If your email is already verified, just log in.</p>
              {askedFor ? (
                <CheckEmail email={askedFor} title="Send a new link" text={`We'll send a new verification link to ${askedFor}.`} />
              ) : (
                <form
                  style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 380, textAlign: 'left' }}
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (email.trim()) setAskedFor(email.trim())
                  }}
                >
                  <TextField label="Your email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button className="btn btn-primary" type="submit">
                    Get a new link
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
