// Sign-up: first name, last name, email, password, Join now.
// On success the back-end emails a verification link; the dialog then shows "Check your email".
import { useState, type FormEvent } from 'react'
import { authApi, type SignupData } from '../../api/auth'
import { ApiError } from '../../api/client'
import { TextField } from '../../components/TextField'
import styles from './AuthForms.module.css'

interface Props {
  onSignedUp: (email: string, emailSent: boolean) => void
  onSwitchToLogin: () => void
}

const EMPTY: SignupData = { first_name: '', last_name: '', email: '', password: '' }

export function SignupForm({ onSignedUp, onSwitchToLogin }: Props) {
  const [form, setForm] = useState<SignupData>(EMPTY)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // One change handler for all inputs: uses the input's `name`.
  const update = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setSubmitting(true)
    try {
      const res = await authApi.signup(form)
      onSignedUp(res.email, res.verification_sent)
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors)
        // Password rule messages come back as a general error.
        if (Object.keys(err.fieldErrors).length === 0) setError(err.message)
      } else {
        setError('Could not create your account.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && <div className="form-error">{error}</div>}

      <div className={styles.row}>
        <TextField
          label="First name"
          name="first_name"
          autoComplete="given-name"
          value={form.first_name}
          onChange={update}
          error={fieldErrors.first_name}
          required
          autoFocus
        />
        <TextField
          label="Last name"
          name="last_name"
          autoComplete="family-name"
          value={form.last_name}
          onChange={update}
          error={fieldErrors.last_name}
          required
        />
      </div>
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Enter email"
        value={form.email}
        onChange={update}
        error={fieldErrors.email}
        required
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={form.password}
        onChange={update}
        error={fieldErrors.password}
        required
      />

      <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Join now'}
      </button>

      <p className={styles.switch}>
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin}>
          Sign in
        </button>
      </p>
    </form>
  )
}
