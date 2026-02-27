'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Expense } from '@/types/expense'
import { getMonthlyTotals } from '@/lib/analytics'
import { formatCurrency } from '@/lib/format'

interface Props {
  expenses: Expense[]
}

export default function MonthlyBarChart({ expenses }: Props) {
  // ISO prefix matches stored `date` format (YYYY-MM-DD).
  const currentYearMonth = new Date().toISOString().slice(0, 7)
  // Recharts Y axis expects human-readable dollars, app state stores cents.
  const data = getMonthlyTotals(expenses, currentYearMonth).map(d => ({
    ...d,
    totalDisplay: d.total / 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${v}`}
        />
        <Tooltip
          formatter={(value) => {
            // Tooltip values arrive as unknown/union from Recharts internals.
            const dollars = typeof value === 'number' ? value : Number(value)
            return [formatCurrency(Math.round(dollars * 100)), 'Spending']
          }}
          cursor={{ fill: '#f1f5f9' }}
        />
        <Bar dataKey="totalDisplay" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
