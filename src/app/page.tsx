'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useExpenses } from '@/context/ExpenseContext'
import { formatCurrency, formatDate } from '@/lib/format'
import { getThisMonthTotal, getTopCategory } from '@/lib/analytics'
import SummaryCard from '@/components/ui/SummaryCard'
import CategoryBadge from '@/components/ui/CategoryBadge'
import SpendingPieChart from '@/components/charts/SpendingPieChart'
import MonthlyBarChart from '@/components/charts/MonthlyBarChart'
import EmptyState from '@/components/ui/EmptyState'
import ExportHub from '@/components/export/ExportHub'

export default function DashboardPage() {
  const { state, hydrated } = useExpenses()
  const { expenses } = state
  const [showExportHub, setShowExportHub] = useState(false)

  // Dashboard KPIs are derived from canonical values stored in cents.
  const now = new Date()
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const totalAllTime = expenses.reduce((sum, e) => sum + e.amount, 0)
  const thisMonth = getThisMonthTotal(expenses, currentYearMonth)
  const topCategory = getTopCategory(expenses)
  const topCategoryTotal = topCategory
    ? expenses.filter(e => e.category === topCategory).reduce((s, e) => s + e.amount, 0)
    : 0
  const recentExpenses = [...expenses]
    // Date is persisted as YYYY-MM-DD, so lexical comparison gives correct ordering.
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  // Wait for persisted data before showing totals/charts to avoid UI flicker.
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400 text-sm animate-pulse">Loading…</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Your spending overview</p>
        </div>
        {expenses.length > 0 && (
          <button
            type="button"
            onClick={() => setShowExportHub(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            </svg>
            Export Hub
          </button>
        )}
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
          value={topCategory ?? 'None'}
          subtitle={topCategory ? formatCurrency(topCategoryTotal) : 'No expenses yet'}
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
          {/* Render analytics panels only when we have at least one expense. */}
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <section aria-label="Spending by category chart" className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Spending by Category</h2>
              <SpendingPieChart expenses={expenses} />
            </section>
            <section aria-label="Monthly spending chart" className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Monthly Spending</h2>
              <MonthlyBarChart expenses={expenses} />
            </section>
          </div>

          {/* Recent expenses */}
          <section aria-label="Recent expenses" className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Recent Expenses</h2>
              <Link
                href="/expenses"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all expenses
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryBadge category={expense.category} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {expense.description}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(expense.date)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 ml-4 shrink-0">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {showExportHub && (
        <ExportHub onClose={() => setShowExportHub(false)} />
      )}
    </div>
  )
}
