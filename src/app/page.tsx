'use client'

import Link from 'next/link'
import { useExpenses } from '@/context/ExpenseContext'
import { formatCurrency, formatDate } from '@/lib/format'
import { getThisMonthTotal, getTopCategory } from '@/lib/analytics'
import SummaryCard from '@/components/ui/SummaryCard'
import CategoryBadge from '@/components/ui/CategoryBadge'
import SpendingPieChart from '@/components/charts/SpendingPieChart'
import MonthlyBarChart from '@/components/charts/MonthlyBarChart'
import EmptyState from '@/components/ui/EmptyState'

export default function DashboardPage() {
  const { state } = useExpenses()
  const { expenses } = state

  const currentYearMonth = new Date().toISOString().slice(0, 7)
  const totalAllTime = expenses.reduce((sum, e) => sum + e.amount, 0)
  const thisMonth = getThisMonthTotal(expenses, currentYearMonth)
  const topCategory = getTopCategory(expenses)
  const topCategoryTotal = topCategory
    ? expenses.filter(e => e.category === topCategory).reduce((s, e) => s + e.amount, 0)
    : 0
  const recentExpenses = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Your spending overview</p>
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
          value={topCategory ?? '—'}
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
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Spending by Category</h2>
              <SpendingPieChart expenses={expenses} />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Monthly Spending</h2>
              <MonthlyBarChart expenses={expenses} />
            </div>
          </div>

          {/* Recent expenses */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Recent Expenses</h2>
              <Link
                href="/expenses"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all →
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
          </div>
        </>
      )}
    </div>
  )
}
