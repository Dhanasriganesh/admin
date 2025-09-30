'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'employee' | 'Super Admin' | 'Agent' | 'Employer'
  user_metadata?: any
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, role: 'admin' | 'employee' | 'Super Admin' | 'Agent' | 'Employer') => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
  isFirstLogin: boolean
  checkFirstLogin: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFirstLogin, setIsFirstLogin] = useState(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'employee',
          user_metadata: session.user.user_metadata
        })
        setToken(session.access_token)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'employee',
          user_metadata: session.user.user_metadata
        })
        setToken(session.access_token)
      } else {
        setUser(null)
        setToken(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email, password: '***' })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Login response:', { data: data ? 'success' : 'no data', error })

      if (error) {
        console.error('Login error:', error)
        throw new Error(error.message)
      }

      if (data.user) {
        console.log('User data:', data.user)
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: data.user.user_metadata?.role || 'employee',
          user_metadata: data.user.user_metadata
        })
        setToken(data.session?.access_token || '')
      }
    } catch (error) {
      console.error('Login catch error:', error)
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string, role: 'admin' | 'employee' | 'Super Admin' | 'Agent' | 'Employer') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || name,
          email: data.user.email || email,
          role: data.user.user_metadata?.role || role,
          user_metadata: data.user.user_metadata
        })
        setToken(data.session?.access_token || '')
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setToken(null)
    setIsFirstLogin(false)
  }

  const checkFirstLogin = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/check-first-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      if (response.ok) {
        setIsFirstLogin(data.isFirstLogin)
        return data.isFirstLogin
      }
      return false
    } catch (error) {
      console.error('Error checking first login:', error)
      return false
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
    isFirstLogin,
    checkFirstLogin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
