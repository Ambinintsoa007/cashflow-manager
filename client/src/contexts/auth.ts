import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'

export type AuthContextType = {
  user: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}