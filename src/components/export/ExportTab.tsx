'use client'

import { useState } from 'react'
import type { Expense } from '@/types/expense'
import { formatCurrency } from '@/lib/format'
import {
  EXPORT_TEMPLATES,
  triggerDownload,
  addExportHistory,
  simulateCloudExport,
  type ExportTemplate,
} from '@/lib/export-cloud'

interface Props {
  expenses: Expense[]
  onToast: (msg: string) => void
}

export default function ExportTab({ expenses, onToast }: Props) {
  const [busy, setBusy] = useState<string | null>(null)

  const handleExport = async (template: ExportTemplate) => {
    setBusy(template.id)
    try {
      await simulateCloudExport('local', '', 600)
      const data = template.generate(expenses)
      const ext = template.format === 'csv' ? 'csv' : template.format === 'json' ? 'json' : 'txt'
      const mime = template.format === 'csv' ? 'text/csv' : template.format === 'json' ? 'application/json' : 'text/plain'
      triggerDownload(data, `${template.id}.${ext}`, mime)
      const total = (template.filterFn ? template.filterFn(expenses) : expenses).reduce((s, e) => s + e.amount, 0)
      addExportHistory({
        templateName: template.name,
        format: ext.toUpperCase(),
        recordCount: template.filterFn ? template.filterFn(expenses).length : expenses.length,
        totalAmount: total,
        destination: 'Local Download',
      })
      onToast(`${template.name} exported successfully`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick stats bar */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
        <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-sm">📊</div>
        <div className="text-sm">
          <span className="font-semibold text-slate-900">{expenses.length}</span>
          <span className="text-slate-500"> records totaling </span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}
          </span>
        </div>
      </div>

      {/* Template cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Export Templates</h3>
        {EXPORT_TEMPLATES.map(t => {
          const count = t.filterFn ? t.filterFn(expenses).length : expenses.length
          const isActive = busy === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleExport(t)}
              disabled={busy !== null || count === 0}
              className="w-full text-left group"
            >
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isActive
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
              } ${count === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}>
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-lg shrink-0 shadow-sm`}>
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{t.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {t.format.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{count} records</p>
                </div>
                <div className="shrink-0">
                  {isActive ? (
                    <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-slate-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
