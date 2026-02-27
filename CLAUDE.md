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

### State Management

Single `ExpenseContext` (React Context + `useReducer`) wraps the entire app in `layout.tsx`. Actions: `ADD_EXPENSE`, `UPDATE_EXPENSE`, `DELETE_EXPENSE`, `SET_FILTER`, `HYDRATE`. Expenses hydrate from localStorage on mount and persist on every change via a `useEffect` guarded by a `hydrated` ref to avoid overwriting stored data on first render. Access state via the `useExpenses()` hook.

### Money Representation

All amounts stored in **cents** (integer) to avoid float precision issues. Use `src/lib/format.ts` helpers (`formatCurrency`, `centsToDisplay`, `displayToCents`) for all conversions between display strings and stored values.

### Routes

| Route | Page | Client Component? |
|---|---|---|
| `/` | Dashboard (summary cards, charts) | TBD |
| `/expenses` | Expense list with filters, CSV export | TBD |
| `/expenses/new` | Add expense form | Server page wraps client `ExpenseForm` |
| `/expenses/[id]/edit` | Edit expense form | `'use client'` — uses `useParams` |

### Key Modules

- `src/types/expense.ts` — All types (`Expense`, `Category`, `FilterState`, `AppState`), constants (`CATEGORIES`, `DEFAULT_FILTERS`), and color maps (`CATEGORY_COLORS`, `CATEGORY_BG`)
- `src/context/ExpenseContext.tsx` — `expenseReducer` (exported for testing), `ExpenseProvider`, `useExpenses` hook
- `src/lib/analytics.ts` — `getCategoryTotals`, `getThisMonthTotal`, `getTopCategory`, `getMonthlyTotals`
- `src/lib/csv.ts` — `generateCSV`, `downloadCSV`
- `src/lib/format.ts` — `formatCurrency`, `centsToDisplay`, `displayToCents`, `formatDate`

### Components

- `src/components/Navbar.tsx` — Desktop top bar + mobile bottom tab bar (switches at `md` breakpoint)
- `src/components/ExpenseForm.tsx` — Shared add/edit form. Accepts optional `initialExpense` prop. Handles inline validation, simulated save delay, Toast on success, then redirects to `/expenses`
- `src/components/ui/` — Reusable UI primitives:
  - `SummaryCard` — Metric card with icon, title, value, optional accent variant
  - `CategoryBadge` — Color-coded badge with emoji per category, `sm`/`md` sizes
  - `Toast` — Auto-dismissing notification (3s), success/error variants, uses `useRef` pattern for stable timer
  - `ConfirmDialog` — Modal with backdrop, focus traps cancel button, closes on Escape
  - `EmptyState` — Centered empty state with optional CTA link

### Path Alias

`@/*` maps to `./src/*` (configured in both `tsconfig.json` and `jest.config.ts`).

## Design Conventions

- **Categories** are a fixed union type: `Food | Transportation | Entertainment | Shopping | Bills | Other`. Always use the `CATEGORIES` array and `Category` type from `src/types/expense.ts`
- **Color scheme:** Slate base + Indigo-600 accent. Danger: Red-600. Success: Emerald-600. Body background: `slate-50` (set in `globals.css`)
- **Category colors** defined in `CATEGORY_BG` (Tailwind classes) and `CATEGORY_COLORS` (hex for Recharts). CategoryBadge includes emoji per category
- **Mobile-first** with Tailwind breakpoints. Navbar collapses to bottom tab bar below `md`. Main content has `pb-20 md:pb-0` to avoid overlap with mobile nav
- **Form pattern:** `ExpenseForm` component is reused for both add and edit. Pass `initialExpense` for edit mode. Validation is inline with `errors` state object keyed by field name
- **Client components** use `'use client'` directive. Keep page-level server components where possible (e.g., `/expenses/new/page.tsx` is server, wraps client form)
- **Tests** live in `src/__tests__/` and use `@testing-library/react` + `jest-dom`. The reducer is exported from `ExpenseContext.tsx` specifically for direct unit testing
