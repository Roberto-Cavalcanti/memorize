'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, Check, CircleHelp, Edit2, LayoutGrid, List, Plus, RotateCcw, Sparkles, Trash2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  onUpdate,
  onUpdateDeck,
  onDelete,
  onReorder,
}: {
  deck: Deck
  cards: FlashCard[]
  loading: boolean
  onBack: () => void
  onStudy: (shuffledCards: FlashCard[]) => void
  onCreate: (front: string, back: string) => void
  onUpdate: (id: number, front: string, back: string) => void
  onUpdateDeck?: (id: number, title: string, description: string) => void
  onDelete: (id: number) => void
  onReorder: (newCards: FlashCard[]) => void
}) {
  const [isRandom, setIsRandom] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const [isEditingDeck, setIsEditingDeck] = useState(false)
  const [editTitle, setEditTitle] = useState(deck.title)
  const [editDescription, setEditDescription] = useState(deck.description || '')

  const addFormRef = useRef<HTMLDivElement>(null)

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

  function handleStartEdit(card: FlashCard) {
    setEditingCard(card)
    setShowAddForm(true)
    setTimeout(() => {
      addFormRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  function handleCancelEdit() {
    setEditingCard(null)
    setShowAddForm(false)
  }

  function handleSaveDeck(e: React.FormEvent) {
    e.preventDefault()
    if (!editTitle.trim() || !onUpdateDeck) return
    onUpdateDeck(deck.id, editTitle.trim(), editDescription.trim())
    setIsEditingDeck(false)
  }

  function handleOpenAddForm() {
    setEditingCard(null)
    setShowAddForm(true)
    setTimeout(() => {
      addFormRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <>
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft data-icon="inline-start" />Voltar aos baralhos
      </button>

      {/* Top Header: Title, Description & Deck Edit Button */}
      <div className="mb-6 rounded-2xl border bg-card p-6 shadow-sm">
        {isEditingDeck ? (
          <form onSubmit={handleSaveDeck} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nome do baralho (máx. 50 caracteres)</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={50}
                placeholder="Nome do baralho"
                className="text-xl font-bold bg-background text-foreground"
                autoFocus
              />
              <span className="text-xs text-muted-foreground mt-1 block text-right">{editTitle.length}/50</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Descrição (máx. 150 caracteres)</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={150}
                placeholder="Descrição (opcional)"
                className="text-sm bg-background text-foreground min-h-[100px]"
              />
              <span className="text-xs text-muted-foreground mt-1 block text-right">{editDescription.length}/150</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingDeck(false)}>
                <X className="mr-1 size-4" /> Cancelar
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Check className="mr-1 size-4" /> Salvar alterações
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <Badge variant="secondary" className="rounded-full text-primary">BARALHO</Badge>
              <h1 className="text-3xl font-bold tracking-tight text-foreground break-words">{deck.title}</h1>
              <p className="text-muted-foreground break-words">{deck.description || 'Adicione cartões para começar a estudar.'}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditTitle(deck.title)
                setEditDescription(deck.description || '')
                setIsEditingDeck(true)
              }}
              className="rounded-xl shrink-0 self-start"
            >
              <Edit2 className="mr-2 size-4" /> Editar baralho
            </Button>
          </div>
        )}
      </div>

      {/* Second Bar: Action Buttons */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card/50 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleOpenAddForm} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus data-icon="inline-start" />Adicionar cartão
          </Button>
          <Button variant="outline" onClick={() => setIsRandom((v) => !v)} className="rounded-xl">
            <RotateCcw data-icon="inline-start" />{isRandom ? 'Ordem: Aleatória' : 'Ordem: Normal'}
          </Button>
          <Button variant="outline" onClick={handleStudyClick} disabled={!cards.length} className="rounded-xl">
            <Sparkles data-icon="inline-start" className="text-primary" />Estudar baralho
          </Button>
        </div>
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-lg h-8 text-xs font-medium"
          >
            <List className="mr-1 size-3.5" /> Lista
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-lg h-8 text-xs font-medium"
          >
            <LayoutGrid className="mr-1 size-3.5" /> Cartões
          </Button>
        </div>
      </div>

      {/* Cards Display Section */}
      <div className="flex flex-col gap-6">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground font-semibold">Cartões do baralho</CardTitle>
            <CardDescription>{cards.length} {cards.length === 1 ? 'cartão' : 'cartões'} cadastrados {viewMode === 'list' ? '(Arraste para reordenar)' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1,2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : cards.length ? (
              viewMode === 'list' ? (
                <div className="flex flex-col gap-3">
                  {cards.map((card, index) => (
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
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleStartEdit(card)} aria-label="Editar cartão"><Edit2 className="size-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(card.id)} aria-label="Excluir cartão"><Trash2 className="size-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cards.map((card, index) => (
                    <div key={card.id} className="rounded-xl border bg-card p-5 flex flex-col justify-between gap-4 shadow-sm relative group hover:border-primary/50 transition-all">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <span>Cartão {String(index + 1).padStart(2, '0')}</span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => handleStartEdit(card)} aria-label="Editar cartão">
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => onDelete(card.id)} aria-label="Excluir cartão">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3 py-1">
                        <div>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Frente</span>
                          <p className="text-sm font-medium text-foreground mt-0.5 break-words">{card.front}</p>
                        </div>
                        <div className="border-t pt-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Verso</span>
                          <p className="text-sm text-muted-foreground mt-0.5 break-words">{card.back}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <CircleHelp className="mx-auto mb-3 text-primary" />Ainda não há cartões neste baralho.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add / Edit Card Form at the bottom */}
        <div ref={addFormRef}>
          {showAddForm && (
            <AddCard
              onCreate={(front, back) => {
                onCreate(front, back)
                setShowAddForm(false)
              }}
              onUpdate={(id, front, back) => {
                onUpdate(id, front, back)
                setEditingCard(null)
                setShowAddForm(false)
              }}
              editingCard={editingCard}
              onCancelEdit={handleCancelEdit}
            />
          )}
        </div>
      </div>
    </>
  )
}
