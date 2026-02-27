import ExpenseForm from '@/components/ExpenseForm'

export default function NewExpensePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add Expense</h1>
        <p className="text-sm text-slate-500 mt-1">Record a new expense</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <ExpenseForm />
      </div>
    </div>
  )
}
