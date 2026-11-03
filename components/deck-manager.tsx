'use client'

import { useState } from 'react'
import { ArrowLeft, CircleHelp, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AddCard } from '@/components/add-card'
import { Deck } from '@/components/deck-card'

export type FlashCard = { id: number; deckId: number; front: string; back: string; position?: number }

export function DeckManager({
  deck,
  cards,
  loading,
  onBack,
  onStudy,
  onCreate,
  onDelete,
  onReorder,
}: {
  deck: Deck
  cards: FlashCard[]
  loading: boolean
  onBack: () => void
  onStudy: (shuffledCards: FlashCard[]) => void
  onCreate: (front: string, back: string) => void
  onDelete: (id: number) => void
  onReorder: (newCards: FlashCard[]) => void
}) {
  const [isRandom, setIsRandom] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  function handleStudyClick() {
    let studyCards = [...cards]
    if (isRandom) {
      studyCards = studyCards.sort(() => Math.random() - 0.5)
    }
    onStudy(studyCards)
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, index: number) {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>, _index?: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>, dropIndex: number) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }
    const updated = [...cards]
    const [movedItem] = updated.splice(draggedIndex, 1)
    updated.splice(dropIndex, 0, movedItem)
    setDraggedIndex(null)
    onReorder(updated)
  }

  return (
    <>
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft data-icon="inline-start" />Voltar aos baralhos
      </button>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <Badge variant="secondary" className="mb-3 rounded-full text-primary">BARALHO</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{deck.title}</h1>
          <p className="mt-2 text-muted-foreground">{deck.description || 'Adicione cartões para começar a estudar.'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setShowAddForm((v) => !v)} className="rounded-xl">
            <Plus data-icon="inline-start" />{showAddForm ? 'Ocultar adição' : 'Adicionar cartão'}
          </Button>
          <Button variant="outline" onClick={() => setIsRandom((v) => !v)} className="rounded-xl">
            <RotateCcw data-icon="inline-start" />{isRandom ? 'Ordem: Aleatória' : 'Ordem: Normal'}
          </Button>
          <Button onClick={handleStudyClick} disabled={!cards.length} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Sparkles data-icon="inline-start" />Estudar baralho
          </Button>
        </div>
      </div>
      <div className={`grid gap-6 ${showAddForm ? 'lg:grid-cols-[1fr_360px]' : 'lg:grid-cols-1'}`}>
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground font-semibold">Cartões do baralho</CardTitle>
            <CardDescription>{cards.length} {cards.length === 1 ? 'cartão' : 'cartões'} cadastrados (Arraste para reordenar)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {loading ? [1,2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />) : cards.length ? cards.map((card, index) => (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e)}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center justify-between gap-4 rounded-xl border bg-card p-4 cursor-grab active:cursor-grabbing transition-all hover:border-primary/50 ${draggedIndex === index ? 'opacity-40 border-dashed border-primary' : ''}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <span className="cursor-grab active:cursor-grabbing text-muted-foreground/70 hover:text-foreground">⠿</span>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </span>
                  <p className="truncate font-semibold text-foreground">{card.front}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDelete(card.id)} aria-label="Excluir cartão"><Trash2 /></Button>
              </div>
            )) : <div className="py-12 text-center text-sm text-muted-foreground"><CircleHelp className="mx-auto mb-3 text-primary" />Ainda não há cartões neste baralho.</div>}
          </CardContent>
        </Card>
        {showAddForm && <AddCard onCreate={onCreate} />}
      </div>
    </>
  )
}
