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
  id: string          // crypto.randomUUID()
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
  Food: '#f97316',           // orange-500
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
