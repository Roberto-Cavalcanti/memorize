'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Brain, Sparkles, ArrowRight, ShieldCheck, Zap, Layers, Sun, Moon } from 'lucide-react'
import Link from 'next/link'

export function LandingPage() {
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Brain className="w-5 h-5" />
            </div>
            Memorize
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
              {isDark ? <Sun className="size-5 text-yellow-500" /> : <Moon className="size-5 text-slate-700" />}
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Entrar</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
                Acessar App <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32 px-4 text-center max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-200/50 dark:border-indigo-800/50">
            <Sparkles className="w-3.5 h-3.5" /> Estudo inteligente com flashcards
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Memorize qualquer conteúdo com <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">eficiência máxima</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Organize baralhos personalizados, ordene seus cartões intuitivamente e teste seus conhecimentos com nosso sistema dinâmico de revisão.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-base px-8 py-6 shadow-xl shadow-indigo-600/25">
                Começar a Estudar Agora <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-white dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Gestão de Baralhos</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                Crie e organize baralhos por tópicos e mantenha sua rotina de aprendizado estruturada e acessível.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Reordenação Intuitiva</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                Reordene seus cartões facilmente com arrastar e soltar (Drag and Drop) para priorizar conceitos importantes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Seguro e Privado</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                Área autenticada com proteção de token Bearer e isolamento completo dos dados por usuário.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>&copy; {new Date().getFullYear()} Memorize. Desenvolvido para alta retenção e aprendizado.</p>
      </footer>
    </div>
  )
}
