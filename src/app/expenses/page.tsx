'use client'

import { useMemo } from 'react'
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

  // Filtering and sorting are memoized to avoid recomputation on unrelated rerenders.
  const filtered = useMemo(() => {
    return expenses
      .filter(e => {
        // Category/date/search predicates are intentionally applied in a single pass.
        if (filters.category !== 'All' && e.category !== filters.category) return false
        if (filters.dateFrom && e.date < filters.dateFrom) return false
        if (filters.dateTo && e.date > filters.dateTo) return false
        if (filters.searchQuery && !e.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, filters])

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0)

  // Reset helper keeps reducer usage consistent with other filter updates.
  function clearFilters() {
    dispatch({ type: 'SET_FILTER', payload: { dateFrom: null, dateTo: null, category: 'All', searchQuery: '' } })
  }

  // Used to toggle "Clear filters" UI and empty-state messaging.
  const hasActiveFilters =
    filters.category !== 'All' || !!filters.dateFrom || !!filters.dateTo || filters.searchQuery !== ''

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
            type="button"
            // Export only what the user is currently viewing (filtered subset).
            onClick={() => downloadCSV(filtered)}
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span aria-hidden="true">⬇️</span> Export CSV
          </button>
          <Link
            href="/expenses/new"
            className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            + Add
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
        <input
          type="search"
          placeholder="Search expenses…"
          value={filters.searchQuery}
          onChange={e => dispatch({ type: 'SET_FILTER', payload: { searchQuery: e.target.value } })}
          aria-label="Search expenses"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
            <label className="text-xs text-slate-500 whitespace-nowrap">From</label>
            <input
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={e => dispatch({ type: 'SET_FILTER', payload: { dateFrom: e.target.value || null } })}
              aria-label="Filter from date"
              className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
            <label className="text-xs text-slate-500 whitespace-nowrap">To</label>
            <input
              type="date"
              value={filters.dateTo ?? ''}
              onChange={e => dispatch({ type: 'SET_FILTER', payload: { dateTo: e.target.value || null } })}
              aria-label="Filter to date"
              className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filters.category}
            onChange={e => dispatch({ type: 'SET_FILTER', payload: { category: e.target.value as Category | 'All' } })}
            aria-label="Filter by category"
            className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No matching expenses' : 'No expenses yet'}
          message={hasActiveFilters ? 'Try adjusting your filters.' : 'Add your first expense to get started.'}
          actionLabel={hasActiveFilters ? undefined : 'Add Expense'}
          actionHref={hasActiveFilters ? undefined : '/expenses/new'}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Desktop header row */}
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
