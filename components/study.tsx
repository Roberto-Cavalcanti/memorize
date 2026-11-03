'use client'

import { useState } from 'react'
import { ArrowLeft, Check, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Deck } from '@/components/deck-card'
import { FlashCard } from '@/components/deck-manager'

export function Study({ deck, cards, onBack }: { deck: Deck; cards: FlashCard[]; onBack: () => void }) {
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [finished, setFinished] = useState(false)
  const [reviewed, setReviewed] = useState<Set<number>>(() => new Set())
  const [cardStatuses, setCardStatuses] = useState<Map<number, 'correct' | 'incorrect'>>(() => new Map())

  const card = cards[current]
  const progress = cards.length ? (reviewed.size / cards.length) * 100 : 0

  function previousCard() {
    if (cards.length <= 1) return
    setCurrent((index) => (index === 0 ? cards.length - 1 : index - 1))
    setFlipped(false)
  }

  function nextCard() {
    if (cards.length <= 1) return
    setCurrent((index) => (index === cards.length - 1 ? 0 : index + 1))
    setFlipped(false)
  }

  function markReviewed(status: 'correct' | 'incorrect') {
    const updatedReviewed = new Set(reviewed)
    updatedReviewed.add(current)
    setReviewed(updatedReviewed)
    const updatedStatuses = new Map(cardStatuses)
    updatedStatuses.set(current, status)
    setCardStatuses(updatedStatuses)
    setFlipped(false)
    if (updatedReviewed.size === cards.length) {
      setFinished(true)
    } else {
      nextCard()
    }
  }

  function restartStudy() {
    setCurrent(0)
    setFlipped(false)
    setFinished(false)
    setReviewed(new Set())
    setCardStatuses(new Map())
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Check />
        </span>
        <h1 className="text-3xl font-bold text-foreground">Sessão concluída!</h1>
        <p className="mt-2 text-muted-foreground">Você revisou {cards.length} {cards.length === 1 ? 'cartão' : 'cartões'} de {deck.title}.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" onClick={onBack}>Voltar ao baralho</Button>
          <Button onClick={restartStudy}><RotateCcw data-icon="inline-start" />Estudar novamente</Button>
        </div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="py-12 text-center">
        <p className="text-foreground">Adicione cartões antes de estudar.</p>
        <Button className="mt-4" onClick={onBack}>Voltar</Button>
      </div>
    )
  }

  const currentStatus = cardStatuses.get(current)
  let cardShadowClass = 'shadow-[0_18px_60px_rgba(36,61,100,0.12)] hover:shadow-[0_22px_70px_rgba(36,61,100,0.16)]'
  if (currentStatus === 'correct') {
    cardShadowClass = 'shadow-[0_18px_60px_rgba(16,185,129,0.25)] hover:shadow-[0_22px_70px_rgba(16,185,129,0.32)] border-emerald-500/30'
  } else if (currentStatus === 'incorrect') {
    cardShadowClass = 'shadow-[0_18px_60px_rgba(239,68,68,0.25)] hover:shadow-[0_22px_70px_rgba(239,68,68,0.32)] border-destructive/30'
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft data-icon="inline-start" /> Sair do estudo
      </button>
      <div className="mb-6 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{deck.title}</span>
        <span className="text-muted-foreground">{current + 1} de {cards.length} · {reviewed.size} revisados</span>
      </div>
      <div className="mb-8 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <button
        onClick={() => setFlipped((value) => !value)}
        className={`group relative flex min-h-90 w-full flex-col items-center justify-center rounded-3xl border bg-card p-10 text-center transition-all ${cardShadowClass}`}
      >
        <span className="absolute left-7 top-7 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {flipped ? 'Verso' : 'Frente'}
        </span>
        {reviewed.has(current) && (
          <span className={`absolute right-7 top-7 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${currentStatus === 'correct' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/15 text-destructive'}`}>
            {currentStatus === 'correct' ? 'Acertou' : 'Reforçar'}
          </span>
        )}
        <p className="max-w-lg text-2xl font-bold leading-relaxed text-card-foreground sm:text-3xl">
          {flipped ? card.back : card.front}
        </p>
        <span className="absolute bottom-7 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <RotateCcw data-icon="inline-start" /> Clique para virar
        </span>
      </button>
      <div className="mt-4 flex justify-center gap-4">
        <Button variant="outline" className="rounded-xl px-8 py-6 border-orange-500/30 text-orange-600 hover:bg-orange-500/10 dark:text-orange-400" onClick={() => markReviewed('incorrect')} disabled={!flipped}>
          <X className="size-5" />
        </Button>
        <Button className="rounded-xl px-8 py-6 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => markReviewed('correct')} disabled={!flipped}>
          <Check className="size-5" />
        </Button>
      </div>
      <div className="mt-5 flex justify-center gap-3">
        <Button variant="outline" onClick={previousCard} disabled={cards.length <= 1}>Anterior</Button>
        <Button variant="outline" onClick={nextCard} disabled={cards.length <= 1}>Próximo</Button>
      </div>
    </div>
  )
}
