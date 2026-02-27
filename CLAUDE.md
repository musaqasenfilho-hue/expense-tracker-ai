# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint (next/core-web-vitals + next/typescript)
npm test             # Run all Jest tests
npm run test:watch   # Jest in watch mode
npx jest src/__tests__/format.test.ts  # Run a single test file
```

## Architecture

Next.js 14 App Router personal expense tracker. Client-side only — no backend, no auth. Data persists in `localStorage`.

**State management:** Single `ExpenseContext` (React Context + `useReducer`) wraps the app in `layout.tsx`. The reducer handles `ADD_EXPENSE`, `UPDATE_EXPENSE`, `DELETE_EXPENSE`, `SET_FILTER`, and `HYDRATE`. Expenses hydrate from localStorage on mount and persist on every change. Access state via the `useExpenses()` hook.

**Money representation:** All amounts stored in **cents** (integer) to avoid float precision issues. Use `src/lib/format.ts` helpers (`formatCurrency`, `centsToDisplay`, `displayToCents`) for conversion.

**Routes:**
| Route | Purpose |
|---|---|
| `/` | Dashboard (summary cards, charts) |
| `/expenses` | Expense list with filters, CSV export |
| `/expenses/new` | Add expense form |
| `/expenses/[id]/edit` | Edit expense form |

**Key modules:**
- `src/types/expense.ts` — `Expense`, `Category`, `FilterState`, `AppState` types plus category color maps
- `src/context/ExpenseContext.tsx` — reducer, provider, `useExpenses` hook
- `src/lib/analytics.ts` — category totals, monthly aggregations
- `src/lib/csv.ts` — CSV generation and download
- `src/lib/format.ts` — currency/date formatting

**Stack:** TypeScript, Tailwind CSS + `tailwind-merge`, Recharts for charts, Inter font via `next/font/google`.

**Path alias:** `@/*` maps to `./src/*` (configured in tsconfig and jest).

## Design Conventions

- Categories are a fixed union type: `Food | Transportation | Entertainment | Shopping | Bills | Other`
- Color scheme: Slate + Indigo accent. Category badges use specific Tailwind color pairings defined in `CATEGORY_BG` and `CATEGORY_COLORS`
- Mobile-first with Tailwind breakpoints. Navbar collapses to bottom tab bar below `md`
- Tests live in `src/__tests__/` and use `@testing-library/react` + `jest-dom`
