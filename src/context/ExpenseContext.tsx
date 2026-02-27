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
