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

  it('sets filters partially', () => {
    const state = expenseReducer(initialState, {
      type: 'SET_FILTER',
      payload: { category: 'Food' },
    })
    expect(state.filters.category).toBe('Food')
  })

  it('hydrates expenses from localStorage', () => {
    const state = expenseReducer(initialState, { type: 'HYDRATE', payload: [sampleExpense] })
    expect(state.expenses).toHaveLength(1)
  })
})
