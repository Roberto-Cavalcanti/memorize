'use client'

import { BookOpen, Flame, Layers3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateDeck } from '@/components/create-deck'
import { Deck, DeckCard } from '@/components/deck-card'

export function Dashboard({
  decks,
  loading,
  onOpen,
  onDelete,
  onCreate,
}: {
  decks: Deck[]
  loading: boolean
  onOpen: (deck: Deck) => void
  onDelete: (id: number) => void
  onCreate: (title: string, description: string) => void
}) {
  return (
    <>
      <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <Badge variant="secondary" className="mb-3 rounded-full px-3 py-1 text-primary">PAINEL DE ESTUDOS</Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">Olá, estudante</h1>
          <p className="mt-2 text-muted-foreground">Escolha um baralho e continue de onde parou.</p>
        </div>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={Layers3} label="Baralhos ativos" value={decks.length.toString()} />
        <Stat icon={BookOpen} label="Cartões para revisar" value="—" />
        <Stat icon={Flame} label="Sequência atual" value="—" accent />
      </div>
      <Separator className="mb-8" />
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Seus baralhos</h2>
          <p className="text-sm text-muted-foreground">Organize seus temas de estudo</p>
        </div>
        <CreateDeck onCreate={onCreate} />
      </div>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
      ) : decks.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><BookOpen /></span>
            <h3 className="font-semibold text-foreground">Seu primeiro baralho começa aqui</h3>
            <p className="max-w-sm text-sm text-muted-foreground">Crie um baralho para organizar seus estudos e transformar revisão em hábito.</p>
            <CreateDeck onCreate={onCreate} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck, index) => <DeckCard key={deck.id} deck={deck} index={index} onOpen={onOpen} onDelete={onDelete} />)}
        </div>
      )}
    </>
  )
}

function Stat({ icon: Icon, label, value, accent }: { icon: typeof Layers3; label: string; value: string; accent?: boolean }) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`flex size-11 items-center justify-center rounded-xl ${accent ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'}`}>
          <Icon />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
