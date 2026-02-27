export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function centsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function displayToCents(value: string): number {
  const num = parseFloat(value)
  if (isNaN(num)) return NaN
  return Math.round(num * 100)
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
