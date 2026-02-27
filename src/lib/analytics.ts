import type { Expense, Category } from '@/types/expense'
import { CATEGORIES } from '@/types/expense'

// Aggregates total spend (in cents) per category for charts and KPIs.
export function getCategoryTotals(expenses: Expense[]): Record<Category, number> {
  const totals = Object.fromEntries(CATEGORIES.map(c => [c, 0])) as Record<Category, number>
  for (const e of expenses) {
    totals[e.category] += e.amount
  }
  return totals
}

// Returns total spend for a specific year-month key (YYYY-MM).
export function getThisMonthTotal(expenses: Expense[], yearMonth: string): number {
  return expenses
    .filter(e => e.date.startsWith(yearMonth))
    .reduce((sum, e) => sum + e.amount, 0)
}

// Picks the category with the highest aggregate spend.
export function getTopCategory(expenses: Expense[]): Category | null {
  if (expenses.length === 0) return null
  const totals = getCategoryTotals(expenses)
  return (Object.entries(totals).sort(([, a], [, b]) => b - a)[0][0]) as Category
}

// Builds a rolling 6-month window ending at `currentYearMonth` for bar chart usage.
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
