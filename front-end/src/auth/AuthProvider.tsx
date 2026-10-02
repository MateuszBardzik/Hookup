/**
 * Holds who is logged in, for the whole app (wraps everything in App.tsx).
 * Read the state from components with `useAuth()` (see useAuth.ts).
 */
import { useEffect, useState, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import { getToken, setToken } from '../api/client'
import { profileApi } from '../api/profile'
import type { AuthResponse, User } from '../types'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => getToken() !== null)

  // On page load: if a token was saved, fetch the user it belongs to.
  useEffect(() => {
    if (!getToken()) return
    profileApi
      .get()
      .then(setUser)
      .catch(() => setToken(null)) // token expired or invalid
      .finally(() => setLoading(false))
  }, [])

  function signIn(res: AuthResponse) {
    setToken(res.token)
    setUser(res.user)
  }

  async function signOut() {
    try {
      await authApi.logout()
    } finally {
      setToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, setUser }}>{children}</AuthContext.Provider>
  )
}
