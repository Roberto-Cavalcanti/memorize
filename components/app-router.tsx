'use client'

import React from 'react'
import { useAuth } from '@/context/auth-context'
import { FlashcardApp } from '@/components/flashcard-app'
import { LandingPage } from '@/components/landing-page'
import { Brain } from 'lucide-react'

export function AppRouter() {
  const { user, token, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-600/30 animate-pulse">
          <Brain className="w-8 h-8" />
        </div>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Carregando Memorize...</p>
      </div>
    )
  }

  // Se estiver autenticado e com token válido, exibe o app principal protegido
  if (token && user) {
    return <FlashcardApp />
  }

  // Caso contrário, exibe a landing page pública
  return <LandingPage />
}
