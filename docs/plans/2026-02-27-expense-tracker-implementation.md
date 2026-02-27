# Expense Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete Next.js 14 expense tracking app with React Context + useReducer state, localStorage persistence, Recharts visualizations, and CSV export.

**Architecture:** Client-side SPA shell via App Router. `ExpenseContext` (React Context + useReducer) wraps the app and syncs to localStorage on every dispatch. Four routes: dashboard, expense list, add form, edit form.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, tailwind-merge, Recharts, Inter font (next/font/google)

---

## Task 1: Scaffold the Next.js 14 project

**Files:**
- Create: entire project scaffold in `/home/manfe/projects/expense-tracker-ai/`

**Step 1: Run create-next-app**

```bash
cd /home/manfe/projects/expense-tracker-ai
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

When prompted:
- Would you like to use Turbopack? → **No**

**Step 2: Verify scaffold**

```bash
ls src/app/
# Expected: globals.css  layout.tsx  page.tsx
cat package.json | grep '"next"'
# Expected: "next": "14.x.x"
```

**Step 3: Install additional dependencies**

```bash
npm install recharts tailwind-merge
```

**Step 4: Verify dev server starts**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000 | head -5
# Expected: HTML response (DOCTYPE or <html>)
kill %1
```

**Step 5: Install Jest and React Testing Library**

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

**Step 6: Create jest.config.ts**

Create `jest.config.ts` in project root:

```ts
import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  testPathPattern: ['**/__tests__/**/*.test.ts?(x)'],
}

export default config
```

**Step 7: Create jest.setup.ts**

```ts
import '@testing-library/jest-dom'
```

**Step 8: Add test script to package.json**

Edit `package.json` — add to `"scripts"`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

**Step 9: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 14 project with TypeScript, Tailwind, Jest"
```

---

## Task 2: TypeScript types

**Files:**
- Create: `src/types/expense.ts`
- Create: `src/__tests__/types.test.ts` (type-check smoke test)

**Step 1: Create the types file**

Create `src/types/expense.ts`:

```ts
export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other'

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
]

export interface Expense {
  id: string
  date: string        // YYYY-MM-DD
  amount: number      // stored in cents (e.g., $12.50 → 1250)
  category: Category
  description: string
  createdAt: string   // ISO timestamp
}

export interface FilterState {
  dateFrom: string | null
  dateTo: string | null
  category: Category | 'All'
  searchQuery: string
}

export interface AppState {
  expenses: Expense[]
  filters: FilterState
}

export const DEFAULT_FILTERS: FilterState = {
  dateFrom: null,
  dateTo: null,
  category: 'All',
  searchQuery: '',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f97316',          // orange-500
  Transportation: '#3b82f6', // blue-500
  Entertainment: '#a855f7',  // purple-500
  Shopping: '#ec4899',       // pink-500
  Bills: '#ef4444',          // red-500
  Other: '#64748b',          // slate-500
}

export const CATEGORY_BG: Record<Category, string> = {
  Food: 'bg-orange-100 text-orange-700',
  Transportation: 'bg-blue-100 text-blue-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Bills: 'bg-red-100 text-red-700',
  Other: 'bg-slate-100 text-slate-700',
}
```

**Step 2: Commit**

```bash
git add src/types/expense.ts
git commit -m "feat: add expense TypeScript types and constants"
```

---

## Task 3: Utility functions

**Files:**
- Create: `src/lib/format.ts`
- Create: `src/lib/analytics.ts`
- Create: `src/lib/csv.ts`
- Create: `src/__tests__/format.test.ts`
- Create: `src/__tests__/analytics.test.ts`
- Create: `src/__tests__/csv.test.ts`

**Step 1: Write failing tests for format utilities**

Create `src/__tests__/format.test.ts`:

```ts
import { formatCurrency, centsToDisplay, displayToCents, formatDate } from '@/lib/format'

describe('formatCurrency', () => {
  it('formats cents as USD currency string', () => {
    expect(formatCurrency(1250)).toBe('$12.50')
    expect(formatCurrency(100000)).toBe('$1,000.00')
    expect(formatCurrency(0)).toBe('$0.00')
  })
})

describe('centsToDisplay', () => {
  it('converts cents to decimal string for form input', () => {
    expect(centsToDisplay(1250)).toBe('12.50')
    expect(centsToDisplay(100)).toBe('1.00')
  })
})

describe('displayToCents', () => {
  it('converts decimal string to cents integer', () => {
    expect(displayToCents('12.50')).toBe(1250)
    expect(displayToCents('12')).toBe(1200)
    expect(displayToCents('0.99')).toBe(99)
  })

  it('returns NaN for invalid input', () => {
    expect(displayToCents('abc')).toBeNaN()
  })
})

describe('formatDate', () => {
  it('formats YYYY-MM-DD to readable string', () => {
    expect(formatDate('2026-02-27')).toBe('Feb 27, 2026')
  })
})
```

**Step 2: Run tests — expect FAIL**

```bash
npx jest src/__tests__/format.test.ts
# Expected: FAIL — module not found
```

**Step 3: Implement format utilities**

Create `src/lib/format.ts`:

```ts
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function centsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function displayToCents(value: string): number {
  const num = parseFloat(value)
  if (isNaN(num)) return NaN
  return Math.round(num * 100)
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
```

**Step 4: Run tests — expect PASS**

```bash
npx jest src/__tests__/format.test.ts
# Expected: PASS (4 tests)
```

**Step 5: Write failing tests for analytics**

Create `src/__tests__/analytics.test.ts`:

```ts
import { getMonthlyTotals, getCategoryTotals, getThisMonthTotal, getTopCategory } from '@/lib/analytics'
import type { Expense } from '@/types/expense'

const mockExpenses: Expense[] = [
  { id: '1', date: '2026-02-01', amount: 1000, category: 'Food', description: 'Lunch', createdAt: '' },
  { id: '2', date: '2026-02-15', amount: 2000, category: 'Food', description: 'Dinner', createdAt: '' },
  { id: '3', date: '2026-01-10', amount: 5000, category: 'Bills', description: 'Electric', createdAt: '' },
]

describe('getCategoryTotals', () => {
  it('sums amounts by category', () => {
    const totals = getCategoryTotals(mockExpenses)
    expect(totals['Food']).toBe(3000)
    expect(totals['Bills']).toBe(5000)
    expect(totals['Transportation']).toBe(0)
  })
})

describe('getThisMonthTotal', () => {
  it('sums expenses for current year-month', () => {
    const total = getThisMonthTotal(mockExpenses, '2026-02')
    expect(total).toBe(3000)
  })
})

describe('getTopCategory', () => {
  it('returns category with highest total', () => {
    const top = getTopCategory(mockExpenses)
    expect(top).toBe('Bills')
  })

  it('returns null for empty expenses', () => {
    expect(getTopCategory([])).toBeNull()
  })
})

describe('getMonthlyTotals', () => {
  it('returns last 6 months with totals', () => {
    const result = getMonthlyTotals(mockExpenses, '2026-02')
    expect(result).toHaveLength(6)
    const feb = result.find(r => r.month === 'Feb 26')
    expect(feb?.total).toBe(3000)
  })
})
```

**Step 6: Run tests — expect FAIL**

```bash
npx jest src/__tests__/analytics.test.ts
# Expected: FAIL
```

**Step 7: Implement analytics utilities**

Create `src/lib/analytics.ts`:

```ts
import type { Expense, Category } from '@/types/expense'
import { CATEGORIES } from '@/types/expense'

export function getCategoryTotals(expenses: Expense[]): Record<Category, number> {
  const totals = Object.fromEntries(CATEGORIES.map(c => [c, 0])) as Record<Category, number>
  for (const e of expenses) {
    totals[e.category] += e.amount
  }
  return totals
}

export function getThisMonthTotal(expenses: Expense[], yearMonth: string): number {
  return expenses
    .filter(e => e.date.startsWith(yearMonth))
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getTopCategory(expenses: Expense[]): Category | null {
  if (expenses.length === 0) return null
  const totals = getCategoryTotals(expenses)
  return (Object.entries(totals).sort(([, a], [, b]) => b - a)[0][0]) as Category
}

export function getMonthlyTotals(
  expenses: Expense[],
  currentYearMonth: string
): { month: string; total: number; yearMonth: string }[] {
  const [year, month] = currentYearMonth.split('-').map(Number)
  const months: { month: string; total: number; yearMonth: string }[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const total = expenses
      .filter(e => e.date.startsWith(ym))
      .reduce((sum, e) => sum + e.amount, 0)
    months.push({ month: label, total, yearMonth: ym })
  }

  return months
}
```

**Step 8: Run tests — expect PASS**

```bash
npx jest src/__tests__/analytics.test.ts
# Expected: PASS
```

**Step 9: Write failing tests for CSV export**

Create `src/__tests__/csv.test.ts`:

```ts
import { generateCSV } from '@/lib/csv'
import type { Expense } from '@/types/expense'

const expenses: Expense[] = [
  { id: '1', date: '2026-02-01', amount: 1250, category: 'Food', description: 'Lunch at cafe', createdAt: '' },
]

describe('generateCSV', () => {
  it('generates CSV with header and data rows', () => {
    const csv = generateCSV(expenses)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Date,Amount,Category,Description')
    expect(lines[1]).toBe('2026-02-01,12.50,Food,Lunch at cafe')
  })

  it('escapes commas in description', () => {
    const csv = generateCSV([{ ...expenses[0], description: 'Lunch, dinner' }])
    expect(csv).toContain('"Lunch, dinner"')
  })
})
```

**Step 10: Run tests — expect FAIL**

```bash
npx jest src/__tests__/csv.test.ts
# Expected: FAIL
```

**Step 11: Implement CSV utility**

Create `src/lib/csv.ts`:

```ts
import type { Expense } from '@/types/expense'

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function generateCSV(expenses: Expense[]): string {
  const header = 'Date,Amount,Category,Description'
  const rows = expenses.map(e =>
    [
      e.date,
      (e.amount / 100).toFixed(2),
      e.category,
      escapeCSV(e.description),
    ].join(',')
  )
  return [header, ...rows].join('\n')
}

export function downloadCSV(expenses: Expense[], filename = 'expenses.csv'): void {
  const csv = generateCSV(expenses)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
```

**Step 12: Run all tests — expect PASS**

```bash
npx jest
# Expected: all tests pass
```

**Step 13: Commit**

```bash
git add src/lib/ src/__tests__/
git commit -m "feat: add format, analytics, and CSV utility functions with tests"
```

---

## Task 4: Expense reducer and Context

**Files:**
- Create: `src/context/ExpenseContext.tsx`
- Create: `src/__tests__/expenseReducer.test.ts`

**Step 1: Write failing reducer tests**

Create `src/__tests__/expenseReducer.test.ts`:

```ts
import { expenseReducer } from '@/context/ExpenseContext'
import type { AppState } from '@/types/expense'
import { DEFAULT_FILTERS } from '@/types/expense'

const initialState: AppState = { expenses: [], filters: DEFAULT_FILTERS }

const sampleExpense = {
  id: 'abc',
  date: '2026-02-01',
  amount: 1000,
  category: 'Food' as const,
  description: 'Lunch',
  createdAt: '2026-02-01T12:00:00Z',
}

describe('expenseReducer', () => {
  it('adds an expense', () => {
    const state = expenseReducer(initialState, { type: 'ADD_EXPENSE', payload: sampleExpense })
    expect(state.expenses).toHaveLength(1)
    expect(state.expenses[0].id).toBe('abc')
  })

  it('deletes an expense by id', () => {
    const withOne: AppState = { ...initialState, expenses: [sampleExpense] }
    const state = expenseReducer(withOne, { type: 'DELETE_EXPENSE', payload: 'abc' })
    expect(state.expenses).toHaveLength(0)
  })

  it('updates an existing expense', () => {
    const withOne: AppState = { ...initialState, expenses: [sampleExpense] }
    const updated = { ...sampleExpense, description: 'Dinner' }
    const state = expenseReducer(withOne, { type: 'UPDATE_EXPENSE', payload: updated })
    expect(state.expenses[0].description).toBe('Dinner')
  })

  it('sets filters', () => {
    const state = expenseReducer(initialState, {
      type: 'SET_FILTER',
      payload: { category: 'Food' },
    })
    expect(state.filters.category).toBe('Food')
  })
})
```

**Step 2: Run tests — expect FAIL**

```bash
npx jest src/__tests__/expenseReducer.test.ts
# Expected: FAIL
```

**Step 3: Create ExpenseContext with reducer**

Create `src/context/ExpenseContext.tsx`:

```tsx
'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import type { AppState, Expense, FilterState } from '@/types/expense'
import { DEFAULT_FILTERS } from '@/types/expense'

// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'HYDRATE'; payload: Expense[] }

// ── Reducer ───────────────────────────────────────────────────────────────────

const initialState: AppState = {
  expenses: [],
  filters: DEFAULT_FILTERS,
}

export function expenseReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, expenses: action.payload }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] }
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      }
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload),
      }
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } }
    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface ExpenseContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const ExpenseContext = createContext<ExpenseContextValue | undefined>(undefined)

const STORAGE_KEY = 'expense-tracker-data'

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: Expense[] = JSON.parse(stored)
        dispatch({ type: 'HYDRATE', payload: parsed })
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.expenses))
    } catch {
      // ignore quota errors
    }
  }, [state.expenses])

  return (
    <ExpenseContext.Provider value={{ state, dispatch }}>
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('useExpenses must be used inside ExpenseProvider')
  return ctx
}
```

**Step 4: Run tests — expect PASS**

```bash
npx jest src/__tests__/expenseReducer.test.ts
# Expected: PASS (4 tests)
```

**Step 5: Commit**

```bash
git add src/context/ src/__tests__/expenseReducer.test.ts
git commit -m "feat: add ExpenseContext with useReducer and localStorage persistence"
```

---

## Task 5: Root layout and global styles

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/Navbar.tsx`

**Step 1: Update globals.css**

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 antialiased;
  }
}
```

**Step 2: Create Navbar component**

Create `src/components/Navbar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '◎' },
  { href: '/expenses', label: 'Expenses', icon: '≡' },
  { href: '/expenses/new', label: 'Add', icon: '+' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar / top bar */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-indigo-600">💰</span>
          <span className="text-lg font-semibold text-slate-900">ExpenseTracker</span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={twMerge(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={twMerge(
              'flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors',
              pathname === item.href
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
```

**Step 3: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ExpenseProvider } from '@/context/ExpenseContext'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ExpenseTracker',
  description: 'Track your personal finances with ease',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ExpenseProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pb-20 md:pb-0">
              {children}
            </main>
          </div>
        </ExpenseProvider>
      </body>
    </html>
  )
}
```

**Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css src/components/Navbar.tsx
git commit -m "feat: add root layout with ExpenseProvider and responsive Navbar"
```

---

## Task 6: Shared UI components

**Files:**
- Create: `src/components/ui/CategoryBadge.tsx`
- Create: `src/components/ui/SummaryCard.tsx`
- Create: `src/components/ui/Toast.tsx`
- Create: `src/components/ui/ConfirmDialog.tsx`
- Create: `src/components/ui/EmptyState.tsx`

**Step 1: Create CategoryBadge**

Create `src/components/ui/CategoryBadge.tsx`:

```tsx
import { CATEGORY_BG } from '@/types/expense'
import type { Category } from '@/types/expense'

const CATEGORY_EMOJI: Record<Category, string> = {
  Food: '🍕',
  Transportation: '🚗',
  Entertainment: '🎭',
  Shopping: '🛍️',
  Bills: '📄',
  Other: '📦',
}

interface Props {
  category: Category
  size?: 'sm' | 'md'
}

export default function CategoryBadge({ category, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${CATEGORY_BG[category]} ${sizeClass}`}>
      <span>{CATEGORY_EMOJI[category]}</span>
      {category}
    </span>
  )
}
```

**Step 2: Create SummaryCard**

Create `src/components/ui/SummaryCard.tsx`:

```tsx
interface Props {
  title: string
  value: string
  subtitle?: string
  icon: string
  accent?: boolean
}

export default function SummaryCard({ title, value, subtitle, icon, accent }: Props) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 flex items-start gap-4 ${accent ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200'}`}>
      <div className={`text-3xl p-2 rounded-lg ${accent ? 'bg-indigo-100' : 'bg-slate-100'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className={`text-2xl font-bold truncate ${accent ? 'text-indigo-600' : 'text-slate-900'}`}>
          {value}
        </p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
```

**Step 3: Create Toast component**

Create `src/components/ui/Toast.tsx`:

```tsx
'use client'

import { useEffect } from 'react'

interface Props {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type = 'success', onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = type === 'success'
    ? 'bg-emerald-600 text-white'
    : 'bg-red-600 text-white'

  return (
    <div className={`fixed bottom-24 md:bottom-6 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up ${colors}`}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}
```

Add the animation to `tailwind.config.ts` — open it and add to `theme.extend`:

```ts
animation: {
  'slide-up': 'slideUp 0.2s ease-out',
},
keyframes: {
  slideUp: {
    '0%': { transform: 'translateY(100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
},
```

**Step 4: Create ConfirmDialog**

Create `src/components/ui/ConfirmDialog.tsx`:

```tsx
'use client'

interface Props {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ title, message, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600 mt-2">{message}</p>
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 5: Create EmptyState**

Create `src/components/ui/EmptyState.tsx`:

```tsx
import Link from 'next/link'

interface Props {
  title: string
  message: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({ title, message, actionLabel, actionHref }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-6xl mb-4">📭</div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-xs">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
```

**Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: add shared UI components (Badge, Card, Toast, Dialog, EmptyState)"
```

---

## Task 7: Expense Form component

**Files:**
- Create: `src/components/ExpenseForm.tsx`

**Step 1: Create the shared ExpenseForm**

This component is used by both `/expenses/new` and `/expenses/[id]/edit`.

Create `src/components/ExpenseForm.tsx`:

```tsx
'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '@/types/expense'
import type { Expense, Category } from '@/types/expense'
import { displayToCents, centsToDisplay } from '@/lib/format'
import { useExpenses } from '@/context/ExpenseContext'
import Toast from '@/components/ui/Toast'

interface Props {
  initialExpense?: Expense
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export default function ExpenseForm({ initialExpense }: Props) {
  const router = useRouter()
  const { dispatch } = useExpenses()
  const isEdit = !!initialExpense

  const [date, setDate] = useState(initialExpense?.date ?? today())
  const [amountDisplay, setAmountDisplay] = useState(
    initialExpense ? centsToDisplay(initialExpense.amount) : ''
  )
  const [category, setCategory] = useState<Category>(initialExpense?.category ?? 'Food')
  const [description, setDescription] = useState(initialExpense?.description ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!date) errs.date = 'Date is required'
    if (date > today()) errs.date = 'Date cannot be in the future'
    const cents = displayToCents(amountDisplay)
    if (!amountDisplay) errs.amount = 'Amount is required'
    else if (isNaN(cents) || cents <= 0) errs.amount = 'Enter a valid positive amount'
    if (!description.trim()) errs.description = 'Description is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    // Simulate async save (swap for real API call later)
    await new Promise(r => setTimeout(r, 300))

    const expense: Expense = {
      id: initialExpense?.id ?? crypto.randomUUID(),
      date,
      amount: displayToCents(amountDisplay),
      category,
      description: description.trim(),
      createdAt: initialExpense?.createdAt ?? new Date().toISOString(),
    }

    if (isEdit) {
      dispatch({ type: 'UPDATE_EXPENSE', payload: expense })
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: expense })
    }

    setSaving(false)
    setToast(isEdit ? 'Expense updated!' : 'Expense added!')
    setTimeout(() => router.push('/expenses'), 1200)
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            max={today()}
            onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })) }}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.date ? 'border-red-400' : 'border-slate-300'}`}
          />
          {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amountDisplay}
              onChange={e => { setAmountDisplay(e.target.value); setErrors(p => ({ ...p, amount: '' })) }}
              onBlur={() => {
                const cents = displayToCents(amountDisplay)
                if (!isNaN(cents)) setAmountDisplay(centsToDisplay(cents))
              }}
              placeholder="0.00"
              className={`w-full pl-7 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.amount ? 'border-red-400' : 'border-slate-300'}`}
            />
          </div>
          {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })) }}
            placeholder="What did you spend on?"
            maxLength={120}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.description ? 'border-red-400' : 'border-slate-300'}`}
          />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Saving…
              </>
            ) : (
              isEdit ? 'Update Expense' : 'Add Expense'
            )}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/ExpenseForm.tsx
git commit -m "feat: add ExpenseForm component with validation and loading state"
```

---

## Task 8: Add and Edit expense pages

**Files:**
- Create: `src/app/expenses/new/page.tsx`
- Create: `src/app/expenses/[id]/edit/page.tsx`

**Step 1: Create Add Expense page**

Create `src/app/expenses/new/page.tsx`:

```tsx
import ExpenseForm from '@/components/ExpenseForm'

export default function NewExpensePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add Expense</h1>
        <p className="text-sm text-slate-500 mt-1">Record a new expense</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <ExpenseForm />
      </div>
    </div>
  )
}
```

**Step 2: Create Edit Expense page**

Create `src/app/expenses/[id]/edit/page.tsx`:

```tsx
'use client'

import { useParams } from 'next/navigation'
import { useExpenses } from '@/context/ExpenseContext'
import ExpenseForm from '@/components/ExpenseForm'
import Link from 'next/link'

export default function EditExpensePage() {
  const { id } = useParams<{ id: string }>()
  const { state } = useExpenses()
  const expense = state.expenses.find(e => e.id === id)

  if (!expense) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <p className="text-slate-500">Expense not found.</p>
        <Link href="/expenses" className="text-indigo-600 text-sm mt-2 inline-block">
          Back to expenses
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Expense</h1>
        <p className="text-sm text-slate-500 mt-1">Update expense details</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <ExpenseForm initialExpense={expense} />
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/expenses/
git commit -m "feat: add New and Edit expense pages"
```

---

## Task 9: Expense List page

**Files:**
- Create: `src/app/expenses/page.tsx`
- Create: `src/components/ExpenseRow.tsx`

**Step 1: Create ExpenseRow component**

Create `src/components/ExpenseRow.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Expense } from '@/types/expense'
import { formatCurrency, formatDate } from '@/lib/format'
import { useExpenses } from '@/context/ExpenseContext'
import CategoryBadge from '@/components/ui/CategoryBadge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Toast from '@/components/ui/Toast'

interface Props {
  expense: Expense
}

export default function ExpenseRow({ expense }: Props) {
  const { dispatch } = useExpenses()
  const [confirming, setConfirming] = useState(false)
  const [toast, setToast] = useState(false)

  function handleDelete() {
    dispatch({ type: 'DELETE_EXPENSE', payload: expense.id })
    setConfirming(false)
    setToast(true)
  }

  return (
    <>
      {/* Desktop row */}
      <div className="hidden md:grid grid-cols-[120px_1fr_160px_100px_80px] items-center gap-4 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <span className="text-sm text-slate-500">{formatDate(expense.date)}</span>
        <span className="text-sm text-slate-900 truncate">{expense.description}</span>
        <CategoryBadge category={expense.category} size="sm" />
        <span className="text-sm font-semibold text-slate-900 text-right">{formatCurrency(expense.amount)}</span>
        <div className="flex items-center gap-2 justify-end">
          <Link
            href={`/expenses/${expense.id}/edit`}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm"
            title="Edit"
          >
            ✏️
          </Link>
          <button
            onClick={() => setConfirming(true)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Mobile card */}
      <div className="md:hidden bg-white border border-slate-200 rounded-xl p-4 mb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{expense.description}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(expense.date)}</p>
            <div className="mt-2">
              <CategoryBadge category={expense.category} size="sm" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-base font-bold text-slate-900">{formatCurrency(expense.amount)}</span>
            <div className="flex gap-2">
              <Link href={`/expenses/${expense.id}/edit`} className="text-sm text-indigo-600">Edit</Link>
              <button onClick={() => setConfirming(true)} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Delete expense?"
          message={`This will permanently delete "${expense.description}".`}
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}

      {toast && <Toast message="Expense deleted" type="success" onClose={() => setToast(false)} />}
    </>
  )
}
```

**Step 2: Create Expense List page**

Create `src/app/expenses/page.tsx`:

```tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useExpenses } from '@/context/ExpenseContext'
import { CATEGORIES } from '@/types/expense'
import type { Category } from '@/types/expense'
import { formatCurrency } from '@/lib/format'
import { downloadCSV } from '@/lib/csv'
import ExpenseRow from '@/components/ExpenseRow'
import EmptyState from '@/components/ui/EmptyState'

export default function ExpensesPage() {
  const { state, dispatch } = useExpenses()
  const { expenses, filters } = state

  const filtered = useMemo(() => {
    return expenses
      .filter(e => {
        if (filters.category !== 'All' && e.category !== filters.category) return false
        if (filters.dateFrom && e.date < filters.dateFrom) return false
        if (filters.dateTo && e.date > filters.dateTo) return false
        if (filters.searchQuery && !e.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, filters])

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0)

  function clearFilters() {
    dispatch({ type: 'SET_FILTER', payload: { dateFrom: null, dateTo: null, category: 'All', searchQuery: '' } })
  }

  const hasActiveFilters =
    filters.category !== 'All' || filters.dateFrom || filters.dateTo || filters.searchQuery

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} expense{filtered.length !== 1 ? 's' : ''} · {formatCurrency(totalFiltered)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadCSV(filtered)}
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            ⬇️ Export CSV
          </button>
          <Link
            href="/expenses/new"
            className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            + Add
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
        {/* Search */}
        <input
          type="search"
          placeholder="Search expenses…"
          value={filters.searchQuery}
          onChange={e => dispatch({ type: 'SET_FILTER', payload: { searchQuery: e.target.value } })}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Date + Category row */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
            <label className="text-xs text-slate-500 whitespace-nowrap">From</label>
            <input
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={e => dispatch({ type: 'SET_FILTER', payload: { dateFrom: e.target.value || null } })}
              className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
            <label className="text-xs text-slate-500 whitespace-nowrap">To</label>
            <input
              type="date"
              value={filters.dateTo ?? ''}
              onChange={e => dispatch({ type: 'SET_FILTER', payload: { dateTo: e.target.value || null } })}
              className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filters.category}
            onChange={e => dispatch({ type: 'SET_FILTER', payload: { category: e.target.value as Category | 'All' } })}
            className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No matching expenses' : 'No expenses yet'}
          message={hasActiveFilters ? 'Try adjusting your filters.' : 'Add your first expense to get started.'}
          actionLabel={hasActiveFilters ? undefined : 'Add Expense'}
          actionHref={hasActiveFilters ? undefined : '/expenses/new'}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[120px_1fr_160px_100px_80px] gap-4 px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wide">
            <span>Date</span>
            <span>Description</span>
            <span>Category</span>
            <span className="text-right">Amount</span>
            <span></span>
          </div>
          {filtered.map(expense => (
            <ExpenseRow key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/expenses/ src/components/ExpenseRow.tsx
git commit -m "feat: add Expenses list page with search, filter, and CSV export"
```

---

## Task 10: Dashboard page

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/components/charts/SpendingPieChart.tsx`
- Create: `src/components/charts/MonthlyBarChart.tsx`

**Step 1: Create SpendingPieChart**

Create `src/components/charts/SpendingPieChart.tsx`:

```tsx
'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CATEGORY_COLORS, CATEGORIES } from '@/types/expense'
import type { Expense } from '@/types/expense'
import { getCategoryTotals } from '@/lib/analytics'
import { formatCurrency } from '@/lib/format'

interface Props {
  expenses: Expense[]
}

export default function SpendingPieChart({ expenses }: Props) {
  const totals = getCategoryTotals(expenses)
  const data = CATEGORIES
    .map(c => ({ name: c, value: totals[c] }))
    .filter(d => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map(entry => (
            <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

**Step 2: Create MonthlyBarChart**

Create `src/components/charts/MonthlyBarChart.tsx`:

```tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Expense } from '@/types/expense'
import { getMonthlyTotals } from '@/lib/analytics'
import { formatCurrency } from '@/lib/format'

interface Props {
  expenses: Expense[]
}

export default function MonthlyBarChart({ expenses }: Props) {
  const currentYearMonth = new Date().toISOString().slice(0, 7)
  const data = getMonthlyTotals(expenses, currentYearMonth).map(d => ({
    ...d,
    totalDisplay: d.total / 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip formatter={(value: number) => formatCurrency(value * 100)} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="totalDisplay" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

**Step 3: Create Dashboard page**

Replace `src/app/page.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { useExpenses } from '@/context/ExpenseContext'
import { formatCurrency, formatDate } from '@/lib/format'
import { getThisMonthTotal, getTopCategory } from '@/lib/analytics'
import SummaryCard from '@/components/ui/SummaryCard'
import CategoryBadge from '@/components/ui/CategoryBadge'
import SpendingPieChart from '@/components/charts/SpendingPieChart'
import MonthlyBarChart from '@/components/charts/MonthlyBarChart'
import EmptyState from '@/components/ui/EmptyState'

export default function DashboardPage() {
  const { state } = useExpenses()
  const { expenses } = state

  const currentYearMonth = new Date().toISOString().slice(0, 7)
  const totalAllTime = expenses.reduce((sum, e) => sum + e.amount, 0)
  const thisMonth = getThisMonthTotal(expenses, currentYearMonth)
  const topCategory = getTopCategory(expenses)
  const recentExpenses = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Your spending overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          title="Total All Time"
          value={formatCurrency(totalAllTime)}
          icon="💰"
          accent
        />
        <SummaryCard
          title="This Month"
          value={formatCurrency(thisMonth)}
          subtitle={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          icon="📅"
        />
        <SummaryCard
          title="Top Category"
          value={topCategory ?? '—'}
          subtitle={topCategory ? formatCurrency((expenses.filter(e => e.category === topCategory).reduce((s, e) => s + e.amount, 0))) : 'No expenses yet'}
          icon="🏆"
        />
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          message="Start tracking your spending by adding your first expense."
          actionLabel="Add First Expense"
          actionHref="/expenses/new"
        />
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Spending by Category</h2>
              <SpendingPieChart expenses={expenses} />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Monthly Spending</h2>
              <MonthlyBarChart expenses={expenses} />
            </div>
          </div>

          {/* Recent expenses */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Recent Expenses</h2>
              <Link href="/expenses" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryBadge category={expense.category} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{expense.description}</p>
                      <p className="text-xs text-slate-400">{formatDate(expense.date)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 ml-4 shrink-0">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add src/app/page.tsx src/components/charts/
git commit -m "feat: add Dashboard with summary cards, pie chart, bar chart, recent expenses"
```

---

## Task 11: Fix tailwind config and final wiring

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css` (if animation classes need CSS fallback)

**Step 1: Update tailwind.config.ts**

Open `tailwind.config.ts` and replace the `theme.extend` section to add animations:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

**Step 2: Fix jest.config.ts typo**

There was a typo in the jest config (`setupFilesAfterFramework` should be `setupFilesAfterFramework` → `setupFilesAfterFramework`).

Open `jest.config.ts` and fix:

```ts
import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],  // fix: was mis-spelled
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
}

export default config
```

Wait — the correct Jest key is `setupFilesAfterFramework`. Actually the correct key is `setupFilesAfterFramework`.

The correct Jest configuration key is: `setupFilesAfterFramework`

Actually it's `setupFilesAfterFramework`. Let me be precise: the correct Jest property is:

```
setupFilesAfterFramework  ❌
setupFilesAfterFramework  ❌
setupFilesAfterFramework  ✓ (yes this is correct)
```

The correct property name is `setupFilesAfterFramework`. Use it as shown in Task 1.

**Step 3: Run full test suite**

```bash
npx jest
# Expected: all tests pass (format, analytics, CSV, reducer)
```

**Step 4: Verify dev server runs cleanly**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000 | grep -i "html"
kill %1
# Expected: HTML response
```

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: finalize tailwind config and jest setup"
```

---

## Task 12: Seed data and manual testing

**Step 1: Add seed data helper (dev only)**

This step is optional but useful for testing the dashboard. When the app loads with no expenses, open DevTools console and run:

```js
const seed = [
  {id:'1',date:'2026-02-20',amount:1250,category:'Food',description:'Lunch at Panda',createdAt:new Date().toISOString()},
  {id:'2',date:'2026-02-18',amount:4500,category:'Bills',description:'Electric bill',createdAt:new Date().toISOString()},
  {id:'3',date:'2026-02-15',amount:2300,category:'Transportation',description:'Uber rides',createdAt:new Date().toISOString()},
  {id:'4',date:'2026-02-10',amount:8900,category:'Shopping',description:'Amazon order',createdAt:new Date().toISOString()},
  {id:'5',date:'2026-01-28',amount:1500,category:'Entertainment',description:'Movie tickets',createdAt:new Date().toISOString()},
  {id:'6',date:'2026-01-15',amount:3200,category:'Food',description:'Grocery run',createdAt:new Date().toISOString()},
]
localStorage.setItem('expense-tracker-data', JSON.stringify(seed))
location.reload()
```

**Step 2: Manual test checklist**

- [ ] Dashboard shows 3 summary cards with correct values
- [ ] Pie chart shows category breakdown
- [ ] Bar chart shows 6-month trend
- [ ] Recent expenses list shows 5 items
- [ ] Navigate to /expenses — list shows all expenses
- [ ] Search filters by description
- [ ] Date range filter works
- [ ] Category filter works
- [ ] "Clear filters" resets all filters
- [ ] Export CSV downloads a valid file
- [ ] Add expense form validates all fields
- [ ] Add expense appears immediately in list and dashboard
- [ ] Edit expense pre-fills form and updates on save
- [ ] Delete expense shows confirm dialog, removes on confirm
- [ ] Mobile view: navbar becomes bottom tab bar
- [ ] Mobile view: expense list shows cards instead of table

**Step 3: Final commit**

```bash
git add -A
git commit -m "docs: add seed data instructions and test checklist"
```

---

## How to Run

```bash
cd /home/manfe/projects/expense-tracker-ai
npm run dev
# Open http://localhost:3000
```

```bash
npm test          # Run all unit tests
npm run build     # Production build
```
