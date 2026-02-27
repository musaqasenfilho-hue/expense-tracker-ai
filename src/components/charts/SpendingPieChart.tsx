'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { CATEGORY_COLORS, CATEGORIES } from '@/types/expense'
import type { Expense } from '@/types/expense'
import { getCategoryTotals } from '@/lib/analytics'
import { formatCurrency } from '@/lib/format'
import type { PieLabelRenderProps } from 'recharts'

interface Props {
  expenses: Expense[]
}

function renderLabel(props: PieLabelRenderProps): string {
  const name = typeof props.name === 'string' ? props.name : String(props.name ?? '')
  const percent = typeof props.percent === 'number' ? props.percent : 0
  return `${name} ${(percent * 100).toFixed(0)}%`
}

export default function SpendingPieChart({ expenses }: Props) {
  const totals = getCategoryTotals(expenses)
  const data = CATEGORIES
    .map(c => ({ name: c, value: totals[c] }))
    .filter(d => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No spending data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="value"
          label={renderLabel}
          labelLine={false}
        >
          {data.map(entry => (
            <Cell
              key={entry.name}
              fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => {
            const cents = typeof value === 'number' ? value : Number(value)
            return formatCurrency(cents)
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
