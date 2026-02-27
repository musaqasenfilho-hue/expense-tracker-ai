'use client'

import { useEffect, useRef } from 'react'

interface Props {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type = 'success', onClose }: Props) {
  // Ref keeps latest callback without re-scheduling timer effect.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), 3000)
    return () => clearTimeout(timer)
  }, []) // stable: runs once on mount

  // Semantic colors aligned with success/error variants.
  const colors = type === 'success'
    ? 'bg-emerald-600 text-white'
    : 'bg-red-600 text-white'

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-24 md:bottom-6 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up ${colors}`}
    >
      <span aria-hidden="true">{type === 'success' ? '✓' : '✕'}</span>
      {message}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onClose}
        className="ml-2 opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}
