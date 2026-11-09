'use client'

import { useCallback, useEffect, useState } from 'react'
import { Brain, Moon, Sun } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dashboard } from '@/components/dashboard'
import { Deck } from '@/components/deck-card'
import { DeckManager, FlashCard } from '@/components/deck-manager'
import { Study } from '@/components/study'
import { useAuth } from '@/context/auth-context'
import { LogOut } from 'lucide-react'

type View =
  | { kind: 'dashboard' }
  | { kind: 'deck'; deck: Deck }
  | { kind: 'study'; deck: Deck }

export function FlashcardApp() {
  const [view, setViewState] = useState<View>({ kind: 'dashboard' })
  const [decks, setDecks] = useState<Deck[]>([])
  const [cards, setCards] = useState<FlashCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [isDark, setIsDark] = useState(false)
  const { logout, apiFetch } = useAuth()

  function setView(newView: View, pushHistory = true) {
    setViewState(newView)
    if (pushHistory) {
      const state = { view: newView }
      if (newView.kind === 'dashboard') {
        window.history.pushState(state, '', window.location.pathname)
      } else if (newView.kind === 'deck') {
        window.history.pushState(state, '', `#deck-${newView.deck.id}`)
      } else if (newView.kind === 'study') {
        window.history.pushState(state, '', `#study-${newView.deck.id}`)
      }
    }
  }

  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ view: { kind: 'dashboard' } }, '', window.location.pathname)
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        const targetView = event.state.view as View
        setViewState(targetView)
        if (targetView.kind === 'deck' || targetView.kind === 'study') {
          loadDeckCardsQuietly(targetView.deck)
        }
      } else {
        setViewState({ kind: 'dashboard' })
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  async function loadDeckCardsQuietly(deck: Deck) {
    setLoading(true)
    setError('')
    try {
      setCards(await apiFetch<FlashCard[]>(`/decks/${deck.id}/cards`))
    } catch {
      setError('Não foi possível carregar os cartões deste baralho.')
    } finally {
      setLoading(false)
    }
  }

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

  const loadDecks = useCallback(async () => {
    setLoading(true); setError('')
    try { setDecks(await apiFetch<Deck[]>('/decks')) } catch { setError('Não foi possível conectar ao backend. Confirme se o Spring Boot está rodando na porta 8080.') } finally { setLoading(false) }
  }, [apiFetch])

  useEffect(() => { loadDecks() }, [loadDecks, refresh])

  async function openDeck(deck: Deck) {
    setView({ kind: 'deck', deck }); setLoading(true); setError('')
    try { setCards(await apiFetch<FlashCard[]>(`/decks/${deck.id}/cards`)) } catch { setError('Não foi possível carregar os cartões deste baralho.') } finally { setLoading(false) }
  }

  async function deleteDeck(id: number) {
    try { await apiFetch(`/decks/${id}`, { method: 'DELETE' }); setDecks((items) => items.filter((deck) => deck.id !== id)) } catch { setError('Não foi possível excluir o baralho.') }
  }

  async function createDeck(title: string, description: string) {
    try { await apiFetch('/decks', { method: 'POST', body: JSON.stringify({ title, description }) }); setRefresh((value) => value + 1) } catch { setError('Não foi possível criar o baralho.') }
  }

  async function updateDeck(id: number, title: string, description: string) {
    try {
      const updatedDeck = await apiFetch<Deck>(`/decks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description })
      })
      setDecks((items) => items.map((d) => (d.id === id ? updatedDeck : d)))
      if (view.kind === 'deck' && view.deck.id === id) {
        setView({ kind: 'deck', deck: updatedDeck }, false)
      }
    } catch {
      setError('Não foi possível atualizar o baralho.')
    }
  }

  async function createCard(front: string, back: string) {
    if (view.kind !== 'deck') return
    try { const card = await apiFetch<FlashCard>(`/decks/${view.deck.id}/cards`, { method: 'POST', body: JSON.stringify({ front, back }) }); setCards((items) => [...items, card]) } catch { setError('Não foi possível adicionar o cartão.') }
  }

  async function updateCard(id: number, front: string, back: string) {
    if (view.kind !== 'deck') return
    try {
      const updatedCard = await apiFetch<FlashCard>(`/decks/${view.deck.id}/cards/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ front, back })
      })
      setCards((items) => items.map((c) => (c.id === id ? updatedCard : c)))
    } catch {
      setError('Não foi possível atualizar o cartão.')
    }
  }

  async function deleteCard(id: number) {
    if (view.kind !== 'deck') return
    try { await apiFetch(`/decks/${view.deck.id}/cards/${id}`, { method: 'DELETE' }); setCards((items) => items.filter((card) => card.id !== id)) } catch { setError('Não foi possível excluir o cartão.') }
  }

  async function reorderCards(newCards: FlashCard[]) {
    if (view.kind !== 'deck') return
    setCards(newCards)
    try {
      const cardIds = newCards.map((c) => c.id)
      await apiFetch(`/decks/${view.deck.id}/cards/reorder`, {
        method: 'PUT',
        body: JSON.stringify(cardIds),
      })
    } catch {
      // Falha silenciosa
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <button className="flex items-center gap-3" onClick={() => setView({ kind: 'dashboard'})} aria-label="Voltar para o início">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Brain /></span>
            <span className="text-left"><span className="block text-lg font-bold tracking-tight text-foreground">Memorize</span><span className="block text-xs text-muted-foreground">estudo inteligente</span></span>
          </button>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
              {isDark ? <Sun className="size-5 text-yellow-500" /> : <Moon className="size-5 text-slate-700" />}
            </Button>
            <div className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
            </div>
            <Button variant="outline" size="sm" onClick={() => logout()} className="gap-2">
              <LogOut className="size-4" /> Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12">
        {error && <Alert variant="destructive" className="mb-6"><AlertDescription className="flex items-center justify-between gap-4">{error}<Button size="sm" variant="outline" onClick={() => setRefresh((v) => v + 1)}>Tentar novamente</Button></AlertDescription></Alert>}
        {view.kind === 'dashboard' && <Dashboard decks={decks} loading={loading} onOpen={openDeck} onDelete={deleteDeck} onCreate={createDeck} />}
        {view.kind === 'deck' && <DeckManager deck={view.deck} cards={cards} loading={loading} onBack={() => setView({ kind: 'dashboard' })} onStudy={(studyCards) => { setCards(studyCards); setView({ kind: 'study', deck: view.deck }); }} onCreate={createCard} onUpdate={updateCard} onUpdateDeck={updateDeck} onDelete={deleteCard} onReorder={reorderCards} />}
        {view.kind === 'study' && <Study deck={view.deck} cards={cards} onBack={() => openDeck(view.deck)} />}
      </main>
    </div>
  )
}
