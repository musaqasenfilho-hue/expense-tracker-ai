'use client'

import { useParams } from 'next/navigation'
import { useExpenses } from '@/context/ExpenseContext'
import ExpenseForm from '@/components/ExpenseForm'
import Link from 'next/link'

export default function EditExpensePage() {
  const { id } = useParams<{ id: string }>()
  const { state, hydrated } = useExpenses()
  const expense = state.expenses.find(e => e.id === id)

  if (!hydrated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-sm">Loading…</div>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <p className="text-slate-500">Expense not found.</p>
        <Link href="/expenses" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
          ← Back to expenses
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Expense</h1>
        <p className="text-sm text-slate-500 mt-1">Update expense details</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <ExpenseForm initialExpense={expense} />
      </div>
    </div>
  )
}
