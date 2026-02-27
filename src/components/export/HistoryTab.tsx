'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/format'
import {
  getExportHistory,
  clearExportHistory,
  timeAgo,
  type ExportHistoryEntry,
} from '@/lib/export-cloud'

interface Props {
  onToast: (msg: string) => void
}

const DEST_ICONS: Record<string, string> = {
  'Local Download': '💾',
  'Google Sheets': '📊',
  'Dropbox': '📦',
  'OneDrive': '☁️',
  'Notion': '📝',
  'Slack': '💬',
}

export default function HistoryTab({ onToast }: Props) {
  const [history, setHistory] = useState<ExportHistoryEntry[]>([])

  useEffect(() => {
    setHistory(getExportHistory())
  }, [])

  const handleClear = () => {
    clearExportHistory()
    setHistory([])
    onToast('Export history cleared')
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-3xl mb-2">📭</div>
        <p className="text-sm text-slate-500">No exports yet</p>
        <p className="text-xs text-slate-400 mt-1">Your export activity will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Activity ({history.length})
        </h3>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-medium text-red-500 hover:text-red-600"
        >
          Clear All
        </button>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />

        <div className="space-y-1">
          {history.map((entry, i) => {
            const icon = entry.destination.includes('@')
              ? '✉️'
              : DEST_ICONS[entry.destination] ?? '📤'

            return (
              <div key={entry.id} className="relative flex items-start gap-3 py-2">
                {/* Timeline dot */}
                <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  i === 0 ? 'bg-indigo-100 ring-2 ring-indigo-500 ring-offset-2' : 'bg-slate-100'
                }`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{entry.templateName}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{entry.format}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {entry.recordCount} records | {formatCurrency(entry.totalAmount)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{entry.destination}</span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs text-slate-400">{timeAgo(entry.timestamp)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
