// Slide 2, left: email, password, Login with Google, Login with Apple, Login Now
import { useState, type FormEvent } from 'react'
import { authApi } from '../../api/auth'
import { ApiError } from '../../api/client'
import { TextField } from '../../components/TextField'
import type { AuthResponse } from '../../types'
import { AppleButton } from './AppleButton'
import { CheckEmail } from './CheckEmail'
import styles from './AuthForms.module.css'
import { GoogleButton } from './GoogleButton'

interface Props {
  onSuccess: (res: AuthResponse) => void
  onSwitchToSignup: () => void
}

export function LoginForm({ onSuccess, onSwitchToSignup }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [unverified, setUnverified] = useState('') // email that still needs verifying
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setUnverified('')
    setSubmitting(true)
    try {
      onSuccess(await authApi.login(email, password))
    } catch (err) {
      if (err instanceof ApiError && err.code === 'email_not_verified') setUnverified(email.trim())
      else setError(err instanceof ApiError ? err.message : 'Could not log in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && <div className="form-error">{error}</div>}
      {unverified && (
        <CheckEmail
          email={unverified}
          tone="warning"
          title="Email verification required"
          text="Please verify your email address before logging in. Open the link we sent you when you signed up."
        />
      )}

      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className={styles.social}>
        <GoogleButton onSuccess={onSuccess} onError={setError} />
        <AppleButton onSuccess={onSuccess} onError={setError} />
      </div>

      <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
        {submitting ? 'Logging in…' : 'Login Now'}
      </button>

      <p className={styles.switch}>
        New here?{' '}
        <button type="button" onClick={onSwitchToSignup}>
          Create an account
        </button>
      </p>
    </form>
  )
}
