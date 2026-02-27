'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Expense } from '@/types/expense'
import { formatCurrency, formatDate } from '@/lib/format'
import { useExpenses } from '@/context/ExpenseContext'
import CategoryBadge from '@/components/ui/CategoryBadge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Toast from '@/components/ui/Toast'

interface Props {
  expense: Expense
}

export default function ExpenseRow({ expense }: Props) {
  const { dispatch } = useExpenses()
  const [confirming, setConfirming] = useState(false)
  const [toast, setToast] = useState(false)

  function handleDelete() {
    dispatch({ type: 'DELETE_EXPENSE', payload: expense.id })
    setConfirming(false)
    setToast(true)
  }

  return (
    <>
      {/* Desktop row */}
      <div className="hidden md:grid grid-cols-[120px_1fr_160px_100px_80px] items-center gap-4 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <span className="text-sm text-slate-500">{formatDate(expense.date)}</span>
        <span className="text-sm text-slate-900 truncate">{expense.description}</span>
        <CategoryBadge category={expense.category} size="sm" />
        <span className="text-sm font-semibold text-slate-900 text-right">{formatCurrency(expense.amount)}</span>
        <div className="flex items-center gap-2 justify-end">
          <Link
            href={`/expenses/${expense.id}/edit`}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit expense"
            aria-label={`Edit ${expense.description}`}
          >
            ✏️
          </Link>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={`Delete ${expense.description}`}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Mobile card */}
      <div className="md:hidden bg-white border border-slate-200 rounded-xl p-4 mb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{expense.description}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(expense.date)}</p>
            <div className="mt-2">
              <CategoryBadge category={expense.category} size="sm" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-base font-bold text-slate-900">{formatCurrency(expense.amount)}</span>
            <div className="flex gap-3">
              <Link
                href={`/expenses/${expense.id}/edit`}
                className="text-sm text-indigo-600 hover:underline"
                aria-label={`Edit ${expense.description}`}
              >Edit</Link>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="text-sm text-red-600 hover:underline"
                aria-label={`Delete ${expense.description}`}
              >Delete</button>
            </div>
          </div>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Delete expense?"
          message={`This will permanently delete "${expense.description}".`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}

      {toast && <Toast message="Expense deleted" onClose={() => setToast(false)} />}
    </>
  )
}
