/**
 * "Check your email" message with a "Resend" button. Used after signing up, when an
 * unverified user tries to log in, and on the verification page when a link has expired.
 */
import { useState } from 'react'
import { ApiError } from '../../api/client'
import { authApi } from '../../api/auth'
import { MailIcon } from '../../components/icons'
import styles from './AuthForms.module.css'

interface Props {
  email: string
  title?: string
  text?: string
  tone?: 'info' | 'warning'
}

export function CheckEmail({ email, title = 'Check your email', text, tone = 'info' }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function resend() {
    setState('sending')
    try {
      await authApi.resendVerification(email)
      setState('sent')
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? 'Too many emails. Please try again later.'
          : err instanceof ApiError && err.message
            ? err.message
            : 'Could not send the email.',
      )
      setState('error')
    }
  }

  return (
    <div className={`${styles.notice} ${tone === 'warning' ? styles.noticeWarning : ''}`} role="status">
      <span className={styles.noticeIcon}>
        <MailIcon />
      </span>
      <div>
        <strong className={styles.noticeTitle}>{title}</strong>
        <p className={styles.noticeText}>
          {text ?? (
            <>
              We sent a verification link to <strong>{email}</strong>. Open it to activate your account, then log in.
            </>
          )}
        </p>
        <p className={styles.noticeText}>
          {state === 'sent' ? (
            'A new link is on its way. Check your inbox (and spam folder).'
          ) : (
            <>
              Didn't get it?{' '}
              <button type="button" className={styles.linkButton} onClick={resend} disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Resend verification email'}
              </button>
            </>
          )}
        </p>
        {state === 'error' && <span className="field-error">{error}</span>}
      </div>
    </div>
  )
}
