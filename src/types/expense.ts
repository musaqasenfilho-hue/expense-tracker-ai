/**
 * Domain contracts for the expense tracker.
 * Monetary values are persisted in integer cents to avoid floating-point drift.
 */
export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other'

// Ordered category list reused by forms, filters, analytics and charts.
export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
]

// Canonical expense record persisted in localStorage.
export interface Expense {
  id: string          // crypto.randomUUID()
  date: string        // YYYY-MM-DD
  amount: number      // stored in cents (e.g., $12.50 → 1250)
  category: Category
  description: string
  createdAt: string   // ISO timestamp
}

// Runtime filter model used by the Expenses page.
export interface FilterState {
  dateFrom: string | null
  dateTo: string | null
  category: Category | 'All'
  searchQuery: string
}

// Global app state stored in context + reducer.
export interface AppState {
  expenses: Expense[]
  filters: FilterState
}

// Reset state for filters and initial app boot.
export const DEFAULT_FILTERS: FilterState = {
  dateFrom: null,
  dateTo: null,
  category: 'All',
  searchQuery: '',
}

// Shared category palette used in pie chart segments.
export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f97316',           // orange-500
  Transportation: '#3b82f6', // blue-500
  Entertainment: '#a855f7',  // purple-500
  Shopping: '#ec4899',       // pink-500
  Bills: '#ef4444',          // red-500
  Other: '#64748b',          // slate-500
}

// Tailwind badge styles for category chips in list and dashboard.
export const CATEGORY_BG: Record<Category, string> = {
  Food: 'bg-orange-100 text-orange-700',
  Transportation: 'bg-blue-100 text-blue-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Bills: 'bg-red-100 text-red-700',
  Other: 'bg-slate-100 text-slate-700',
}
