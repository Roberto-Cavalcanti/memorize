'use client'

import { BookOpen, ChevronRight, Trash2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export type Deck = { id: number; title: string; description?: string }

export function DeckCard({ deck, index, onOpen, onDelete }: { deck: Deck; index: number; onOpen: (deck: Deck) => void; onDelete: (id: number) => void }) {
  const colors = ['bg-primary/10 text-primary', 'bg-orange-500/10 text-orange-500', 'bg-emerald-500/10 text-emerald-600']

  return (
    <Card className="group rounded-2xl border-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <span className={`flex size-11 items-center justify-center rounded-xl ${colors[index % colors.length]}`}>
            <BookOpen />
          </span>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="text-muted-foreground opacity-0 transition group-hover:opacity-100" aria-label={`Excluir ${deck.title}`}><Trash2 /></Button>} />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir este baralho?</AlertDialogTitle>
                <AlertDialogDescription>Todos os cartões de “{deck.title}” também serão removidos.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(deck.id)}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <CardTitle className="mt-3 line-clamp-1 text-foreground font-semibold">{deck.title}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-10 text-muted-foreground">{deck.description || 'Sem descrição adicionada.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="ghost" className="-ml-3 text-primary hover:text-primary/80" onClick={() => onOpen(deck)}>
          Abrir baralho <ChevronRight data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  )
}
