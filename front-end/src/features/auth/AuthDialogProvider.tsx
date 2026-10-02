// Owns the Login / Sign-up dialog so any component can open it (see useAuthDialog.ts).
import { useState, type ReactNode } from 'react'
import { AuthDialogs, type AuthMode } from './AuthDialogs'
import { AuthDialogContext } from './useAuthDialog'

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null)

  return (
    <AuthDialogContext.Provider value={{ openAuthDialog: setMode }}>
      {children}
      {mode && <AuthDialogs mode={mode} onModeChange={setMode} onClose={() => setMode(null)} />}
    </AuthDialogContext.Provider>
  )
}
