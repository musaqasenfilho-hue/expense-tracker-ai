'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '@/types/expense'
import type { Expense, Category } from '@/types/expense'
import { displayToCents, centsToDisplay } from '@/lib/format'
import { useExpenses } from '@/context/ExpenseContext'
import Toast from '@/components/ui/Toast'

interface Props {
  initialExpense?: Expense
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export default function ExpenseForm({ initialExpense }: Props) {
  const router = useRouter()
  const { dispatch } = useExpenses()
  const isEdit = !!initialExpense
  const [todayStr] = useState(() => today())

  const [date, setDate] = useState(initialExpense?.date ?? today())
  const [amountDisplay, setAmountDisplay] = useState(
    initialExpense ? centsToDisplay(initialExpense.amount) : ''
  )
  const [category, setCategory] = useState<Category>(initialExpense?.category ?? 'Food')
  const [description, setDescription] = useState(initialExpense?.description ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!date) errs.date = 'Date is required'
    else if (date > todayStr) errs.date = 'Date cannot be in the future'
    const cents = displayToCents(amountDisplay)
    if (!amountDisplay) errs.amount = 'Amount is required'
    else if (isNaN(cents) || cents <= 0) errs.amount = 'Enter a valid positive amount'
    if (!description.trim()) errs.description = 'Description is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    await new Promise(r => setTimeout(r, 300))

    const expense: Expense = {
      id: initialExpense?.id ?? crypto.randomUUID(),
      date,
      amount: displayToCents(amountDisplay),
      category,
      description: description.trim(),
      createdAt: initialExpense?.createdAt ?? new Date().toISOString(),
    }

    if (isEdit) {
      dispatch({ type: 'UPDATE_EXPENSE', payload: expense })
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: expense })
    }

    setToast(isEdit ? 'Expense updated!' : 'Expense added!')
    setTimeout(() => router.push('/expenses'), 1200)
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            max={todayStr}
            onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })) }}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'date-error' : undefined}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.date ? 'border-red-400' : 'border-slate-300'}`}
          />
          {errors.date && <p id="date-error" role="alert" className="text-xs text-red-600 mt-1">{errors.date}</p>}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" aria-hidden="true">$</span>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amountDisplay}
              onChange={e => { setAmountDisplay(e.target.value); setErrors(p => ({ ...p, amount: '' })) }}
              onBlur={() => {
                const cents = displayToCents(amountDisplay)
                if (!isNaN(cents) && cents > 0) setAmountDisplay(centsToDisplay(cents))
              }}
              placeholder="0.00"
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
              className={`w-full pl-7 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.amount ? 'border-red-400' : 'border-slate-300'}`}
            />
          </div>
          {errors.amount && <p id="amount-error" role="alert" className="text-xs text-red-600 mt-1">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            id="category"
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })) }}
            placeholder="What did you spend on?"
            maxLength={120}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.description ? 'border-red-400' : 'border-slate-300'}`}
          />
          {errors.description && <p id="description-error" role="alert" className="text-xs text-red-600 mt-1">{errors.description}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <span>Saving…</span>
              </>
            ) : (
              isEdit ? 'Update Expense' : 'Add Expense'
            )}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
