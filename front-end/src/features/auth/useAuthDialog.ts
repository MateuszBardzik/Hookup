/**
 * Open the Login / Sign-up dialog from anywhere:
 *   const { openAuthDialog } = useAuthDialog()
 *   openAuthDialog('signup')
 * The dialog itself lives in AuthDialogProvider.tsx.
 */
import { createContext, useContext } from 'react'
import type { AuthMode } from './AuthDialogs'

export interface AuthDialogState {
  openAuthDialog: (mode: AuthMode) => void
}

export const AuthDialogContext = createContext<AuthDialogState | null>(null)

export function useAuthDialog(): AuthDialogState {
  const ctx = useContext(AuthDialogContext)
  if (!ctx) throw new Error('useAuthDialog must be used inside <AuthDialogProvider>')
  return ctx
}
