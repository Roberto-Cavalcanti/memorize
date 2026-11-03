'use client'

import { useEffect, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FlashCard } from '@/components/deck-manager'

export function AddCard({
  onCreate,
  onUpdate,
  editingCard,
  onCancelEdit,
}: {
  onCreate: (front: string, back: string) => void
  onUpdate?: (id: number, front: string, back: string) => void
  editingCard?: FlashCard | null
  onCancelEdit?: () => void
}) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')

  useEffect(() => {
    if (editingCard) {
      setFront(editingCard.front)
      setBack(editingCard.back)
    } else {
      setFront('')
      setBack('')
    }
  }, [editingCard])

  function submit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return
    if (editingCard && onUpdate) {
      onUpdate(editingCard.id, front.trim(), back.trim())
    } else {
      onCreate(front.trim(), back.trim())
    }
    setFront('')
    setBack('')
  }

  return (
    <Card className="h-fit rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground font-bold">
            {editingCard ? 'Editar cartão' : 'Novo cartão'}
          </CardTitle>
          {editingCard && onCancelEdit && (
            <Button variant="ghost" size="sm" onClick={onCancelEdit} className="h-8 text-xs">
              Cancelar
            </Button>
          )}
        </div>
        <CardDescription>
          {editingCard ? 'Modifique a pergunta e a resposta.' : 'Crie uma pergunta e sua resposta.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={submit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="front" className="font-semibold text-foreground">Frente</Label>
            <Textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Ex.: What does 'hello' mean?"
              className="text-foreground placeholder:text-muted-foreground bg-background"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="back" className="font-semibold text-foreground">Verso</Label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Ex.: Olá"
              className="text-foreground placeholder:text-muted-foreground bg-background"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            {editingCard ? <Check data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
            {editingCard ? 'Salvar alterações' : 'Adicionar cartão'}
          </Button>
        </CardContent>
      </form>
    </Card>
  )
}
