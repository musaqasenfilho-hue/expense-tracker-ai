'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { useExpenses } from '@/context/ExpenseContext'
import Toast from '@/components/ui/Toast'
import ExportTab from './ExportTab'
import ConnectTab from './ConnectTab'
import ShareTab from './ShareTab'
import ScheduleTab from './ScheduleTab'
import HistoryTab from './HistoryTab'

type Tab = 'export' | 'connect' | 'share' | 'schedule' | 'history'

interface Props {
  onClose: () => void
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'export', label: 'Export', icon: '📤' },
  { key: 'connect', label: 'Connect', icon: '🔗' },
  { key: 'share', label: 'Share', icon: '🌐' },
  { key: 'schedule', label: 'Schedule', icon: '⏰' },
  { key: 'history', label: 'History', icon: '📋' },
]

export default function ExportHub({ onClose }: Props) {
  const { state } = useExpenses()
  const { expenses } = state
  const [activeTab, setActiveTab] = useState<Tab>('export')
  const [toast, setToast] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const id = useId()
  const titleId = `${id}-title`

  // Slide-in animation
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    closeBtnRef.current?.focus()
  }, [])

  // Escape + focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
        return
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, input, select, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleToast = (msg: string) => setToast(msg)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex justify-end">
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleClose}
        />

        {/* Slide-over panel */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`relative w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
            visible ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 id={titleId} className="text-lg font-bold text-white">Export Hub</h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={handleClose}
                aria-label="Close export hub"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-indigo-100">
              Export, share, and sync your expense data across platforms.
            </p>
          </div>

          {/* Tab navigation */}
          <div className="flex border-b border-slate-200 bg-white px-2 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {activeTab === 'export' && <ExportTab expenses={expenses} onToast={handleToast} />}
            {activeTab === 'connect' && <ConnectTab onToast={handleToast} />}
            {activeTab === 'share' && <ShareTab expenses={expenses} onToast={handleToast} />}
            {activeTab === 'schedule' && <ScheduleTab onToast={handleToast} />}
            {activeTab === 'history' && <HistoryTab onToast={handleToast} />}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400 text-center">
              Cloud features are simulated for demo. Data stays in your browser.
            </p>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
