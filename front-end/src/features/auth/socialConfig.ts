/**
 * Helpers shared by GoogleButton and AppleButton.
 *  - getAuthConfig(): asks the back-end which client IDs are set (.env), once.
 *  - loadScript():    adds an external <script> to the page, once.
 */
import { authApi } from '../../api/auth'
import type { AuthConfig } from '../../types'

let configPromise: Promise<AuthConfig> | null = null

export function getAuthConfig(): Promise<AuthConfig> {
  configPromise ??= authApi.config().catch(() => ({
    google_client_id: '',
    apple_client_id: '',
    apple_redirect_uri: '',
  }))
  return configPromise
}

const scripts: Record<string, Promise<void>> = {}

export function loadScript(src: string): Promise<void> {
  scripts[src] ??= new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.async = true
    el.onload = () => resolve()
    el.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(el)
  })
  return scripts[src]
}
