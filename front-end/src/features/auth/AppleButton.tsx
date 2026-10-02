/**
 * "Login with Apple" using Sign in with Apple JS (popup mode).
 * Apple returns a signed ID token which we send to our back-end.
 *
 * Needs APPLE_CLIENT_ID and APPLE_REDIRECT_URI in back-end/.env and a real
 * HTTPS domain (Apple does not allow localhost).
 */
import { useEffect, useState } from 'react'
import { authApi } from '../../api/auth'
import { ApiError } from '../../api/client'
import type { AuthConfig, AuthResponse } from '../../types'
import { NotConfigured } from './GoogleButton'
import { getAuthConfig, loadScript } from './socialConfig'

const APPLE_SDK = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'

// Minimal typing for the part of Apple's SDK we use.
interface AppleSignInResult {
  authorization: { id_token: string }
  user?: { name?: { firstName?: string; lastName?: string } } // only on first login
}
interface AppleSdk {
  auth: {
    init: (opts: Record<string, unknown>) => void
    signIn: () => Promise<AppleSignInResult>
  }
}

interface Props {
  onSuccess: (res: AuthResponse) => void
  onError: (message: string) => void
}

export function AppleButton({ onSuccess, onError }: Props) {
  const [config, setConfig] = useState<AuthConfig | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getAuthConfig().then(setConfig)
  }, [])

  if (!config) return null
  if (!config.apple_client_id) return <NotConfigured label="Login with Apple" envName="APPLE_CLIENT_ID" />

  async function handleClick() {
    if (!config) return
    setBusy(true)
    try {
      await loadScript(APPLE_SDK)
      const AppleID = (window as unknown as { AppleID: AppleSdk }).AppleID
      AppleID.auth.init({
        clientId: config.apple_client_id,
        redirectURI: config.apple_redirect_uri,
        scope: 'name email',
        usePopup: true,
      })
      const result = await AppleID.auth.signIn()
      const name = result.user?.name ?? {}
      onSuccess(await authApi.apple(result.authorization.id_token, name.firstName, name.lastName))
    } catch (err) {
      // Closing the popup also lands here; only show real errors.
      if (err instanceof ApiError) onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" className="btn btn-dark btn-block" onClick={handleClick} disabled={busy}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M11.2 8.5c0-1.6 1.3-2.4 1.4-2.4-.8-1.1-2-1.3-2.4-1.3-1-.1-2 .6-2.5.6s-1.3-.6-2.2-.6C4.4 4.8 3.3 5.5 2.7 6.6c-1.2 2.1-.3 5.2.9 6.9.6.8 1.2 1.7 2.1 1.7.8 0 1.2-.6 2.2-.6s1.3.6 2.2.5c.9 0 1.5-.8 2-1.7.6-.9.9-1.8.9-1.9 0 0-1.8-.7-1.8-3zM9.6 3.6c.5-.6.8-1.3.7-2.1-.7 0-1.5.5-2 1-.4.5-.8 1.3-.7 2.1.8.1 1.5-.4 2-1z" />
      </svg>
      {busy ? 'Opening Apple…' : 'Login with Apple'}
    </button>
  )
}
