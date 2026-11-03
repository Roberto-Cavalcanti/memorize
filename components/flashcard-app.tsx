'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  CircleHelp,
  Flame,
  Layers3,
  Moon,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  Trash2,
  X,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

const API_URL = "http://localhost:8080/api"
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

type Deck = { id: number; title: string; description?: string }
type FlashCard = { id: number; deckId: number; front: string; back: string }
type View =
  | { kind: 'dashboard' }
  | { kind: 'deck'; deck: Deck }
  | { kind: 'study'; deck: Deck }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  if (!response.ok) throw new Error(`Erro ${response.status}`)
  return response.status === 204 ? (undefined as T) : response.json()
}

export function FlashcardApp() {
  const [view, setViewState] = useState<View>({ kind: 'dashboard' })
  const [decks, setDecks] = useState<Deck[]>([])
  const [cards, setCards] = useState<FlashCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [isDark, setIsDark] = useState(false)

  // Wrapper para atualizar view e empurrar estado para o histórico do navegador
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
    // Registrar estado inicial no histórico se não houver
    if (!window.history.state) {
      window.history.replaceState({ view: { kind: 'dashboard' } }, '', window.location.pathname)
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        const targetView = event.state.view as View
        setViewState(targetView)
        if (targetView.kind === 'deck') {
          loadDeckCardsQuietly(targetView.deck)
        } else if (targetView.kind === 'study') {
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
      setCards(await request<FlashCard[]>(`/decks/${deck.id}/cards`))
    } catch {
      setError('Não foi possível carregar os cartões deste baralho.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check initial document state or preference
    const isDarkMode = document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [])

  function toggleTheme() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }

  const loadDecks = useCallback(async () => {
    setLoading(true); setError('')
    try { setDecks(await request<Deck[]>('/decks')) } catch { setError('Não foi possível conectar ao backend. Confirme se o Spring Boot está rodando na porta 8080.') } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadDecks() }, [loadDecks, refresh])

  async function openDeck(deck: Deck) {
    setView({ kind: 'deck', deck }); setLoading(true); setError('')
    try { setCards(await request<FlashCard[]>(`/decks/${deck.id}/cards`)) } catch { setError('Não foi possível carregar os cartões deste baralho.') } finally { setLoading(false) }
  }

  async function deleteDeck(id: number) {
    try { await request(`/decks/${id}`, { method: 'DELETE' }); setDecks((items) => items.filter((deck) => deck.id !== id)) } catch { setError('Não foi possível excluir o baralho.') }
  }

  async function createDeck(title: string, description: string) {
    try { await request('/decks', { method: 'POST', body: JSON.stringify({ title, description }) }); setRefresh((value) => value + 1) } catch { setError('Não foi possível criar o baralho.') }
  }

  async function createCard(front: string, back: string) {
    if (view.kind !== 'deck') return
    try { const card = await request<FlashCard>(`/decks/${view.deck.id}/cards`, { method: 'POST', body: JSON.stringify({ front, back }) }); setCards((items) => [...items, card]) } catch { setError('Não foi possível adicionar o cartão.') }
  }

  async function deleteCard(id: number) {
    if (view.kind !== 'deck') return
    try { await request(`/decks/${view.deck.id}/cards/${id}`, { method: 'DELETE' }); setCards((items) => items.filter((card) => card.id !== id)) } catch { setError('Não foi possível excluir o cartão.') }
  }

  return <div className="min-h-screen bg-background text-foreground">
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
          <div className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex"><span className="flex items-center gap-1.5"><Flame className="text-orange-500" data-icon="inline-start" /> dias de sequência</span><span className="flex items-center gap-1.5"><Sparkles className="text-primary" data-icon="inline-start" /> Seu ritmo, seu aprendizado</span></div>
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12">
      {error && <Alert variant="destructive" className="mb-6"><AlertDescription className="flex items-center justify-between gap-4">{error}<Button size="sm" variant="outline" onClick={() => setRefresh((v) => v + 1)}>Tentar novamente</Button></AlertDescription></Alert>}
      {view.kind === 'dashboard' && <Dashboard decks={decks} loading={loading} onOpen={openDeck} onDelete={deleteDeck} onCreate={createDeck} />}
      {view.kind === 'deck' && <DeckManager deck={view.deck} cards={cards} loading={loading} onBack={() => setView({ kind: 'dashboard' })} onStudy={(studyCards) => { setCards(studyCards); setView({ kind: 'study', deck: view.deck }); }} onCreate={createCard} onDelete={deleteCard} />}
      {view.kind === 'study' && <Study deck={view.deck} cards={cards} onBack={() => openDeck(view.deck)} />}
    </main>
  </div>
}

function Dashboard({ decks, loading, onOpen, onDelete, onCreate }: { decks: Deck[]; loading: boolean; onOpen: (deck: Deck) => void; onDelete: (id: number) => void; onCreate: (title: string, description: string) => void }) {
  return <>
    <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><Badge variant="secondary" className="mb-3 rounded-full px-3 py-1 text-primary">PAINEL DE ESTUDOS</Badge><h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">Olá, estudante</h1><p className="mt-2 text-muted-foreground">Escolha um baralho e continue de onde parou.</p></div><CreateDeck onCreate={onCreate} /></div>
    <div className="mb-8 grid gap-4 sm:grid-cols-3"><Stat icon={Layers3} label="Baralhos ativos" value={decks.length.toString()} /><Stat icon={BookOpen} label="Cartões para revisar" value="—" /><Stat icon={Flame} label="Sequência atual" value="—" accent /></div>
    <Separator className="mb-8" />
    <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold text-foreground">Seus baralhos</h2><p className="text-sm text-muted-foreground">Organize seus temas de estudo</p></div></div>
    {loading ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div> : decks.length === 0 ? <Card className="rounded-2xl border-dashed"><CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center"><span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><BookOpen /></span><h3 className="font-semibold text-foreground">Seu primeiro baralho começa aqui</h3><p className="max-w-sm text-sm text-muted-foreground">Crie um baralho para organizar seus estudos e transformar revisão em hábito.</p><CreateDeck onCreate={onCreate} /></CardContent></Card> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{decks.map((deck, index) => <DeckCard key={deck.id} deck={deck} index={index} onOpen={onOpen} onDelete={onDelete} />)}</div>}
  </>
}

function Stat({ icon: Icon, label, value, accent }: { icon: typeof Layers3; label: string; value: string; accent?: boolean }) { return <Card className="rounded-2xl border-0 shadow-sm"><CardContent className="flex items-center gap-4 p-5"><span className={`flex size-11 items-center justify-center rounded-xl ${accent ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'}`}><Icon /></span><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-xl font-bold text-foreground">{value}</p></div></CardContent></Card> }
function DeckCard({ deck, index, onOpen, onDelete }: { deck: Deck; index: number; onOpen: (deck: Deck) => void; onDelete: (id: number) => void }) { const colors = ['bg-primary/10 text-primary', 'bg-orange-500/10 text-orange-500', 'bg-emerald-500/10 text-emerald-600']; return <Card className="group rounded-2xl border-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><CardHeader className="pb-3"><div className="flex items-start justify-between"><span className={`flex size-11 items-center justify-center rounded-xl ${colors[index % colors.length]}`}><BookOpen /></span><AlertDialog><AlertDialogTrigger render={<Button variant="ghost" size="icon" className="text-muted-foreground opacity-0 transition group-hover:opacity-100" aria-label={`Excluir ${deck.title}`}><Trash2 /></Button>} /><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir este baralho?</AlertDialogTitle><AlertDialogDescription>Todos os cartões de “{deck.title}” também serão removidos.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(deck.id)}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div><CardTitle className="mt-3 line-clamp-1 text-foreground font-semibold">{deck.title}</CardTitle><CardDescription className="line-clamp-2 min-h-10 text-muted-foreground">{deck.description || 'Sem descrição adicionada.'}</CardDescription></CardHeader><CardContent><Button variant="ghost" className="-ml-3 text-primary hover:text-primary/80" onClick={() => onOpen(deck)}>Abrir baralho <ChevronRight data-icon="inline-end" /></Button></CardContent></Card> }

function CreateDeck({ onCreate }: { onCreate: (title: string, description: string) => void }) { const [open, setOpen] = useState(false); const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); function submit(e: React.SyntheticEvent<HTMLFormElement>) { e.preventDefault(); if (!title.trim()) return; onCreate(title.trim(), description.trim()); setTitle(''); setDescription(''); setOpen(false) } return open ? <form onSubmit={submit} className="flex w-full flex-col gap-2 rounded-2xl border bg-card p-4 shadow-sm sm:w-80"><Label htmlFor="deck-title" className="font-semibold text-foreground">Nome do baralho</Label><Input id="deck-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Inglês básico" autoFocus className="text-foreground placeholder:text-muted-foreground bg-background" /><Label htmlFor="deck-description" className="font-semibold text-foreground">Descrição <span className="font-normal text-muted-foreground">(opcional)</span></Label><Input id="deck-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="O que você vai aprender?" className="text-foreground placeholder:text-muted-foreground bg-background" /><div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit">Criar baralho</Button></div></form> : <Button onClick={() => setOpen(true)} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"><Plus data-icon="inline-start" />Novo baralho</Button> }

function DeckManager({ deck, cards, loading, onBack, onStudy, onCreate, onDelete }: { deck: Deck; cards: FlashCard[]; loading: boolean; onBack: () => void; onStudy: (shuffledCards: FlashCard[]) => void; onCreate: (front: string, back: string) => void; onDelete: (id: number) => void }) {
  const [isRandom, setIsRandom] = useState(false);
  const [showAddForm, setShowAddForm] = useState(true);

  function handleStudyClick() {
    let studyCards = [...cards];
    if (isRandom) {
      studyCards = studyCards.sort(() => Math.random() - 0.5);
    }
    onStudy(studyCards);
  }

  return <>
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
          <CardDescription>{cards.length} {cards.length === 1 ? 'cartão' : 'cartões'} cadastrados</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {loading ? [1,2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />) : cards.length ? cards.map((card, index) => <div key={card.id} className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4"><div className="flex min-w-0 items-center gap-3"><span className="text-xs font-semibold text-muted-foreground">{String(index + 1).padStart(2, '0')}</span><p className="truncate font-semibold text-foreground">{card.front}</p></div><Button variant="ghost" size="icon" onClick={() => onDelete(card.id)} aria-label="Excluir cartão"><Trash2 /></Button></div>) : <div className="py-12 text-center text-sm text-muted-foreground"><CircleHelp className="mx-auto mb-3 text-primary" />Ainda não há cartões neste baralho.</div>}
        </CardContent>
      </Card>
      {showAddForm && <AddCard onCreate={onCreate} />}
    </div>
  </>
}
function AddCard({ onCreate }: { onCreate: (front: string, back: string) => void }) { const [front, setFront] = useState(''); const [back, setBack] = useState(''); function submit(e: React.SyntheticEvent) { e.preventDefault(); if (!front.trim() || !back.trim()) return; onCreate(front.trim(), back.trim()); setFront(''); setBack('') } return <Card className="h-fit rounded-2xl border-0 shadow-sm"><CardHeader><CardTitle className="text-foreground font-bold">Novo cartão</CardTitle><CardDescription>Crie uma pergunta e sua resposta.</CardDescription></CardHeader><form onSubmit={submit}><CardContent className="flex flex-col gap-4"><div className="flex flex-col gap-2"><Label htmlFor="front" className="font-semibold text-foreground">Frente</Label><Textarea id="front" value={front} onChange={(e) => setFront(e.target.value)} placeholder="Ex.: What does 'hello' mean?" className="text-foreground placeholder:text-muted-foreground bg-background" /></div><div className="flex flex-col gap-2"><Label htmlFor="back" className="font-semibold text-foreground">Verso</Label><Textarea id="back" value={back} onChange={(e) => setBack(e.target.value)} placeholder="Ex.: Olá" className="text-foreground placeholder:text-muted-foreground bg-background" /></div><Button type="submit" className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"><Plus data-icon="inline-start" />Adicionar cartão</Button></CardContent></form></Card> }

function Study({ deck, cards, onBack, }: { deck: Deck; cards: FlashCard[];  onBack: () => void;}) { const [current, setCurrent] = useState(0); const [flipped, setFlipped] = useState(false); const [finished, setFinished] = useState(false); const [reviewed, setReviewed] = useState<Set<number>>(() => new Set()); const [cardStatuses, setCardStatuses] = useState<Map<number, 'correct' | 'incorrect'>>(() => new Map()); const card = cards[current]; const progress = cards.length ? (reviewed.size / cards.length) * 100 : 0; function previousCard() { if (cards.length <= 1) return; setCurrent((index) => (index === 0 ? cards.length - 1 : index - 1)); setFlipped(false); } function nextCard() { if (cards.length <= 1) return; setCurrent((index) => (index === cards.length - 1 ? 0 : index + 1)); setFlipped(false); } function markReviewed(status: 'correct' | 'incorrect') { const updatedReviewed = new Set(reviewed); updatedReviewed.add(current); setReviewed(updatedReviewed); const updatedStatuses = new Map(cardStatuses); updatedStatuses.set(current, status); setCardStatuses(updatedStatuses); setFlipped(false); if (updatedReviewed.size === cards.length) { setFinished(true); } else { nextCard(); } } function restartStudy() { setCurrent(0); setFlipped(false); setFinished(false); setReviewed(new Set()); setCardStatuses(new Map()); } if (finished) { return ( <div className="mx-auto max-w-xl py-10 text-center"> <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"> <Check /> </span> <h1 className="text-3xl font-bold text-foreground"> Sessão concluída! </h1> <p className="mt-2 text-muted-foreground"> Você revisou {cards.length}{" "} {cards.length === 1 ? "cartão" : "cartões"} de {deck.title}. </p> <div className="mt-8 flex justify-center gap-3"> <Button variant="outline" onClick={onBack}> Voltar ao baralho </Button> <Button onClick={restartStudy}> <RotateCcw data-icon="inline-start" /> Estudar novamente </Button> </div> </div> ); } if (!card) { return ( <div className="py-12 text-center"> <p className="text-foreground">Adicione cartões antes de estudar.</p> <Button className="mt-4" onClick={onBack}> Voltar </Button> </div> ); } const currentStatus = cardStatuses.get(current); let cardShadowClass = "shadow-[0_18px_60px_rgba(36,61,100,0.12)] hover:shadow-[0_22px_70px_rgba(36,61,100,0.16)]"; if (currentStatus === 'correct') { cardShadowClass = "shadow-[0_18px_60px_rgba(16,185,129,0.25)] hover:shadow-[0_22px_70px_rgba(16,185,129,0.32)] border-emerald-500/30"; } else if (currentStatus === 'incorrect') { cardShadowClass = "shadow-[0_18px_60px_rgba(239,68,68,0.25)] hover:shadow-[0_22px_70px_rgba(239,68,68,0.32)] border-destructive/30"; } return ( <div className="mx-auto max-w-2xl"> <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" > <ArrowLeft data-icon="inline-start" /> Sair do estudo </button> <div className="mb-6 flex items-center justify-between text-sm"> <span className="font-medium text-foreground">{deck.title}</span> <span className="text-muted-foreground"> {current + 1} de {cards.length} · {reviewed.size} revisados </span> </div> <div className="mb-8 h-2 overflow-hidden rounded-full bg-muted"> <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /> </div> <button onClick={() => setFlipped((value) => !value)} className={`group relative flex min-h-[360px] w-full flex-col items-center justify-center rounded-3xl border bg-card p-10 text-center transition-all ${cardShadowClass}`} > <span className="absolute left-7 top-7 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary"> {flipped ? "Verso" : "Frente"} </span> {reviewed.has(current) && ( <span className={`absolute right-7 top-7 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${currentStatus === 'correct' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/15 text-destructive'}`}> {currentStatus === 'correct' ? 'Acertou' : 'Reforçar'} </span> )} <p className="max-w-lg text-2xl font-bold leading-relaxed text-card-foreground sm:text-3xl"> {flipped ? card.back : card.front} </p> <span className="absolute bottom-7 flex items-center gap-2 text-sm font-semibold text-muted-foreground"> <RotateCcw data-icon="inline-start" /> Clique para virar </span> </button> <div className="mt-4 flex justify-center gap-4"> <Button variant="outline" className="rounded-xl px-8 py-6 border-orange-500/30 text-orange-600 hover:bg-orange-500/10 dark:text-orange-400" onClick={() => markReviewed('incorrect')} disabled={!flipped} > <X className="size-5" /> </Button> <Button className="rounded-xl px-8 py-6 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => markReviewed('correct')} disabled={!flipped} > <Check className="size-5" /> </Button> </div> <div className="mt-5 flex justify-center gap-3"> <Button variant="outline" onClick={previousCard} disabled={cards.length <= 1} > Anterior </Button> <Button variant="outline" onClick={nextCard} disabled={cards.length <= 1} > Próximo </Button> </div> </div> );
}
