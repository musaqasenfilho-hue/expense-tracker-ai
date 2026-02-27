'use client'

import { useEffect, useRef } from 'react'

interface Props {
  title: string
  message: string
  // Label override allows reuse for non-delete confirmations.
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }: Props) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null)

  // Focus the cancel button on mount
  useEffect(() => {
    cancelBtnRef.current?.focus()
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    // Backdrop + centered dialog keeps destructive actions explicit.
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
      >
        <h3 id="dialog-title" className="text-lg font-semibold text-slate-900">{title}</h3>
        <p id="dialog-message" className="text-sm text-slate-600 mt-2">{message}</p>
        <div className="flex gap-3 mt-6 justify-end">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
