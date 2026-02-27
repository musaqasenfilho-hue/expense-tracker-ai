'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef, useMemo, useState, ReactNode } from 'react'
import type { AppState, Expense, FilterState } from '@/types/expense'
import { DEFAULT_FILTERS } from '@/types/expense'

// Centralized reducer actions for expense CRUD + filtering + initial hydration.
// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  // Inserts newest expenses at the top of the list.
  | { type: 'ADD_EXPENSE'; payload: Expense }
  // Replaces an existing item matched by id.
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  // Removes an item by id.
  | { type: 'DELETE_EXPENSE'; payload: string }
  // Merges partial filter changes without resetting untouched fields.
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  // Restores persisted expenses from localStorage on app boot.
  | { type: 'HYDRATE'; payload: Expense[] }

// ── Reducer ───────────────────────────────────────────────────────────────────

// Single source of truth for state defaults.
const initialState: AppState = {
  expenses: [],
  filters: DEFAULT_FILTERS,
}

// Pure reducer: all state transitions for expense data and filters flow through here.
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
    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface ExpenseContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  hydrated: boolean
}

const ExpenseContext = createContext<ExpenseContextValue | undefined>(undefined)

// Local storage key used to persist only the expenses array.
const STORAGE_KEY = 'expense-tracker-data'

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState)
  // Guards persistence effect until hydration has completed.
  const hydrated = useRef(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          dispatch({ type: 'HYDRATE', payload: parsed as Expense[] })
        }
      }
    } catch {
      // ignore parse errors
    }
    hydrated.current = true
    setIsHydrated(true)
  }, [])

  // Persist to localStorage on every change
  useEffect(() => {
    if (!hydrated.current) return
    try {
      // Persist only expense records; filters remain per-session UI state.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.expenses))
    } catch {
      // ignore quota errors
    }
  }, [state.expenses])

  // Memoized context value to avoid unnecessary rerenders in consumers.
  const value = useMemo(() => ({ state, dispatch, hydrated: isHydrated }), [state, dispatch, isHydrated])

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext)
  // Fast-fail when hook is used outside provider to surface wiring errors early.
  if (!ctx) throw new Error('useExpenses must be used inside ExpenseProvider')
  return ctx
}
