'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function AddCard({ onCreate }: { onCreate: (front: string, back: string) => void }) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')

  function submit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return
    onCreate(front.trim(), back.trim())
    setFront('')
    setBack('')
  }

  return (
    <Card className="h-fit rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground font-bold">Novo cartão</CardTitle>
        <CardDescription>Crie uma pergunta e sua resposta.</CardDescription>
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
            <Plus data-icon="inline-start" />Adicionar cartão
          </Button>
        </CardContent>
      </form>
    </Card>
  )
}
