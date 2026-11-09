'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, ArrowRight, Lock, Mail, Sun, Moon } from 'lucide-react'
import Link from 'next/link'

function LoginForm() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  let loginFn: ((token: string, user: any) => void) | undefined
  try {
    const auth = useAuth()
    loginFn = auth.login
  } catch {
    // Caso renderizado fora do AuthProvider durante o build estático
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })

      if (!res.ok) {
        throw new Error('Usuário/E-mail ou senha inválidos.')
      }

      const data = await res.json()
      const token = data.token || data.accessToken
      const user = data.user || { id: data.id || '1', name: data.name || identifier.split('@')[0], email: identifier }

      if (!token) {
        throw new Error('Token de autenticação não retornado pelo servidor.')
      }

      if (loginFn) {
        loginFn(token, user)
      } else {
        localStorage.setItem('memorize_token', token)
        window.location.href = '/'
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao realizar login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto bg-indigo-100 dark:bg-indigo-950/50 w-12 h-12 rounded-full flex items-center justify-center mb-2 text-indigo-600 dark:text-indigo-400">
          <Lock className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-white">Entrar na sua conta</CardTitle>
        <CardDescription className="text-zinc-600 dark:text-zinc-400">
          Digite suas credenciais para acessar seus baralhos e flashcards
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-6 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-zinc-700 dark:text-zinc-300">E-mail ou Usuário</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              <Input
                id="identifier"
                type="text"
                placeholder="admin ou seu@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="pl-9 text-zinc-900 dark:text-white bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 text-zinc-900 dark:text-white bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 shadow-lg shadow-indigo-600/20"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  function toggleTheme() {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      document.cookie = 'theme=dark; path=/; max-age=31536000'
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      document.cookie = 'theme=light; path=/; max-age=31536000'
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-zinc-900 dark:text-white">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Brain className="w-5 h-5" />
            </div>
            Memorize
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
              {isDark ? <Sun className="size-5 text-yellow-500" /> : <Moon className="size-5 text-slate-700" />}
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm">Voltar para Início</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
        &copy; {new Date().getFullYear()} Memorize. Todos os direitos reservados.
      </footer>
    </div>
  )
}
