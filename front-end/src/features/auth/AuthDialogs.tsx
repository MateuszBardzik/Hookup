/**
 * Shows the Login dialog or the Sign-up dialog and lets the user switch between them.
 * After signing up it shows "Check your email" (the account must be verified by email first). After a successful login/sign-up, goes to the dashboard (/portal),
 * except on the Apply page, which stays open so the person can fill in the form.
 */
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { Modal } from '../../components/Modal'
import type { AuthResponse } from '../../types'
import { CheckEmail } from './CheckEmail'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

export type AuthMode = 'login' | 'signup'

interface Props {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onClose: () => void
}

export function AuthDialogs({ mode, onModeChange, onClose }: Props) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [sentTo, setSentTo] = useState('') // email the verification link was sent to
  const [sendFailed, setSendFailed] = useState(false) // account created, but the email couldn't be sent

  function handleSuccess(res: AuthResponse) {
    signIn(res)
    onClose()
    if (!pathname.startsWith('/apply')) navigate('/portal')
  }

  return mode === 'login' ? (
    <Modal title="Log in" onClose={onClose}>
      <LoginForm onSuccess={handleSuccess} onSwitchToSignup={() => onModeChange('signup')} />
    </Modal>
  ) : sentTo ? (
    <Modal title="Verify your email" onClose={onClose}>
      {sendFailed ? (
        <CheckEmail
          email={sentTo}
          tone="warning"
          title="Your account was created"
          text={`But we couldn't send the verification email to ${sentTo} just now. Please try "Resend" in a moment.`}
        />
      ) : (
        <CheckEmail email={sentTo} />
      )}
      <button className="btn btn-outline btn-block" style={{ marginTop: 16 }} onClick={() => onModeChange('login')}>
        Go to login
      </button>
    </Modal>
  ) : (
    <Modal title="Join now" onClose={onClose}>
      <SignupForm
        onSignedUp={(email, sent) => {
          setSentTo(email)
          setSendFailed(!sent)
        }}
        onSwitchToLogin={() => onModeChange('login')}
      />
    </Modal>
  )
}
