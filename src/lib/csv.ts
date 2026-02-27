import type { Expense } from '@/types/expense'

// Escapes CSV fields that contain commas, quotes or line breaks.
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// Serializes expenses to CSV text using dollar display values in the Amount column.
export function generateCSV(expenses: Expense[]): string {
  const header = 'Date,Amount,Category,Description'
  const rows = expenses.map(e =>
    [
      e.date,
      (e.amount / 100).toFixed(2),
      e.category,
      escapeCSV(e.description),
    ].join(',')
  )
  return [header, ...rows].join('\n')
}

// Creates a browser download for the generated CSV file.
export function downloadCSV(expenses: Expense[], filename = 'expenses.csv'): void {
  const csv = generateCSV(expenses)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
