/**
 * `useAuth()` gives any component the login state:
 *   user        the logged-in user, or null
 *   loading     true while a saved token is checked on page load
 *   signIn()    save token + user after login / signup
 *   signOut()   log out
 *   setUser()   replace the user object (after editing the profile)
 * The values come from <AuthProvider> (AuthProvider.tsx).
 */
import { createContext, useContext } from 'react'
import type { AuthResponse, User } from '../types'

export interface AuthState {
  user: User | null
  loading: boolean
  signIn: (res: AuthResponse) => void
  signOut: () => Promise<void>
  setUser: (user: User) => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
