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
    const feb = result.find(r => r.yearMonth === '2026-02')
    expect(feb?.total).toBe(3000)
  })
})
