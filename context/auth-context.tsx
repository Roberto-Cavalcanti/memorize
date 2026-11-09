'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  apiFetch: <T>(endpoint: string, options?: RequestInit) => Promise<T>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Restaurar sessão ao carregar
  useEffect(() => {
    const storedToken = localStorage.getItem('memorize_token')
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchUser(currentToken: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      })
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
      } else {
        // Token inválido ou expirado
        logout(false)
      }
    } catch (err) {
      console.error('Erro ao autenticar sessão:', err)
      // Se falhar por erro de rede, mantemos o token provisoriamente ou limpamos dependendo da política.
      // Por segurança, se der erro 401/403 o fetchUser limpa.
    } finally {
      setLoading(false)
    }
  }

  function login(newToken: string, newUser: User) {
    localStorage.setItem('memorize_token', newToken)
    setToken(newToken)
    setUser(newUser)
    router.push('/')
  }

  function logout(redirect = true) {
    localStorage.removeItem('memorize_token')
    setToken(null)
    setUser(null)
    if (redirect) {
      router.push('/login')
    }
  }

  async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      logout()
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}`
      try {
        const errData = await response.json()
        if (errData.message || errData.error) {
          errorMessage = errData.message || errData.error
        }
      } catch {
        // ignore json parse error
      }
      throw new Error(errorMessage)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
