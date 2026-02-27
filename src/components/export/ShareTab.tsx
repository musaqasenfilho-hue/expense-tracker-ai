'use client'

import { useState, useMemo } from 'react'
import type { Expense } from '@/types/expense'
import { formatCurrency } from '@/lib/format'
import { EXPORT_TEMPLATES, generateShareId, addExportHistory } from '@/lib/export-cloud'

interface Props {
  expenses: Expense[]
  onToast: (msg: string) => void
}

// Deterministic QR-like SVG pattern from a hash string
function QRPlaceholder({ value }: { value: string }) {
  const cells = useMemo(() => {
    const grid: boolean[][] = []
    let seed = 0
    for (let i = 0; i < value.length; i++) seed = ((seed << 5) - seed + value.charCodeAt(i)) | 0
    const next = () => { seed = (seed * 16807 + 0) % 2147483647; return seed }

    for (let r = 0; r < 21; r++) {
      grid[r] = []
      for (let c = 0; c < 21; c++) {
        // Fixed finder patterns (top-left, top-right, bottom-left)
        const isFinder = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)
        const isFinderBorder = isFinder && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 13 && (r === 14 || r === 20)) || (c >= 13 && (c === 14 || c === 20)))
        const isFinderCenter = isFinder && r >= 2 && r <= 4 && c >= 2 && c <= 4
        const isFinderCenterTR = isFinder && r >= 2 && r <= 4 && c >= 16 && c <= 18
        const isFinderCenterBL = isFinder && r >= 16 && r <= 18 && c >= 2 && c <= 4
        if (isFinderBorder || isFinderCenter || isFinderCenterTR || isFinderCenterBL) {
          grid[r][c] = true
        } else if (isFinder) {
          grid[r][c] = false
        } else {
          grid[r][c] = next() % 3 !== 0
        }
      }
    }
    return grid
  }, [value])

  return (
    <svg viewBox="0 0 25 25" className="w-full h-full" shapeRendering="crispEdges">
      <rect x="0" y="0" width="25" height="25" fill="white" />
      {cells.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c + 2} y={r + 2} width="1" height="1" fill="#0f172a" /> : null
        )
      )}
    </svg>
  )
}

export default function ShareTab({ expenses, onToast }: Props) {
  const [shareId] = useState(() => generateShareId())
  const [selectedTemplate, setSelectedTemplate] = useState(EXPORT_TEMPLATES[0].id)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://expenses.app/shared/${shareId}`
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onToast('Share link copied to clipboard')
  }

  const handleEmailSend = async () => {
    if (!email) return
    setSending(true)
    await new Promise(r => setTimeout(r, 1500))
    addExportHistory({
      templateName: EXPORT_TEMPLATES.find(t => t.id === selectedTemplate)?.name ?? 'Export',
      format: 'EMAIL',
      recordCount: expenses.length,
      totalAmount: total,
      destination: email,
    })
    setSending(false)
    setEmail('')
    onToast(`Report sent to ${email}`)
  }

  return (
    <div className="space-y-5">
      {/* Share link section */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Share Link</h3>
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-sm text-slate-600 truncate">{shareUrl}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all shrink-0 ${
                copied
                  ? 'text-emerald-700 bg-emerald-100'
                  : 'text-white bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* QR Code */}
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-lg border border-slate-200 bg-white p-1 shrink-0">
              <QRPlaceholder value={shareUrl} />
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <p className="font-medium text-slate-700">Scan to view</p>
              <p>Anyone with this link can view a read-only snapshot of your export.</p>
              <p>Link expires in 7 days.</p>
              <p className="text-slate-400">
                {expenses.length} records | {formatCurrency(total)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Email section */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Send via Email</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="share-template" className="text-xs text-slate-500 mb-1 block">Report template</label>
            <select
              id="share-template"
              value={selectedTemplate}
              onChange={e => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {EXPORT_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.format.toUpperCase()})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="share-email" className="text-xs text-slate-500 mb-1 block">Recipient email</label>
            <div className="flex gap-2">
              <input
                id="share-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleEmailSend}
                disabled={!email || sending}
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg transition-colors shrink-0 inline-flex items-center gap-1.5"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending
                  </>
                ) : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}