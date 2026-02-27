import { generateCSV } from '@/lib/csv'
import type { Expense } from '@/types/expense'

// Minimal fixture to assert CSV shape and escaping behavior.
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

  it('escapes double quotes in description', () => {
    const csv = generateCSV([{ ...expenses[0], description: 'She said "hello"' }])
    expect(csv).toContain('"She said ""hello"""')
  })
})
