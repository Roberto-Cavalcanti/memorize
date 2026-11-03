'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CreateDeck({ onCreate }: { onCreate: (title: string, description: string) => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim()) return
    onCreate(title.trim(), description.trim())
    setTitle('')
    setDescription('')
    setOpen(false)
  }

  return open ? (
    <form onSubmit={submit} className="flex w-full flex-col gap-2 rounded-2xl border bg-card p-4 shadow-sm sm:w-80">
      <Label htmlFor="deck-title" className="font-semibold text-foreground">Nome do baralho</Label>
      <Input
        id="deck-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ex.: Inglês básico"
        autoFocus
        className="text-foreground placeholder:text-muted-foreground bg-background"
      />
      <Label htmlFor="deck-description" className="font-semibold text-foreground">
        Descrição <span className="font-normal text-muted-foreground">(opcional)</span>
      </Label>
      <Input
        id="deck-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="O que você vai aprender?"
        className="text-foreground placeholder:text-muted-foreground bg-background"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button type="submit">Criar baralho</Button>
      </div>
    </form>
  ) : (
    <Button onClick={() => setOpen(true)} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
      <Plus data-icon="inline-start" />Novo baralho
    </Button>
  )
}
