# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- **Development Server**: `pnpm dev`
- **Build**: `pnpm build`
- **Start Production**: `pnpm start`

## Architecture & Structure
- **Frontend Framework**: Next.js (App Router) with React 19 and Tailwind CSS.
- **Component Organization**:
  - `components/flashcard-app.tsx`: Root client component managing global state, view routing (`dashboard`, `deck`, `study`), theme toggle, and API requests.
  - `components/dashboard.tsx`: Main dashboard view listing active decks and statistics.
  - `components/deck-manager.tsx`: Deck management view featuring HTML5 drag-and-drop card reordering (`onReorder`) with backend persistence, random/normal study mode toggle, and card management.
  - `components/study.tsx`: Interactive flashcard study interface with flip animations, correct/incorrect status tracking, dynamic success/error shadow coloring, and progress bar.
  - `components/deck-card.tsx`: Individual deck card component with delete confirmation dialog.
  - `components/create-deck.tsx` & `components/add-card.tsx`: Form components for creating new decks and flashcards.
- **Backend Communication**: REST API calls communicating with a Spring Boot backend running on `http://localhost:8080/api`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
