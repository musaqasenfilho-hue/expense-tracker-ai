'use client'

import { useState, useEffect } from 'react'
import {
  EXPORT_TEMPLATES,
  CLOUD_SERVICES,
  getSchedules,
  saveSchedule,
  deleteSchedule,
  getConnectedServices,
  computeNextRun,
  type ExportSchedule,
} from '@/lib/export-cloud'

interface Props {
  onToast: (msg: string) => void
}

const FREQUENCIES = [
  { value: 'daily' as const, label: 'Daily', desc: 'Every day at midnight' },
  { value: 'weekly' as const, label: 'Weekly', desc: 'Every Monday at 8am' },
  { value: 'monthly' as const, label: 'Monthly', desc: '1st of each month' },
]

export default function ScheduleTab({ onToast }: Props) {
  const [schedules, setSchedules] = useState<ExportSchedule[]>([])
  const [connectedServices, setConnectedServices] = useState<string[]>([])
  const [showNew, setShowNew] = useState(false)
  const [newTemplate, setNewTemplate] = useState(EXPORT_TEMPLATES[0].id)
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [newDest, setNewDest] = useState('')

  useEffect(() => {
    setSchedules(getSchedules())
    setConnectedServices(getConnectedServices())
  }, [])

  const destinations = [
    { id: 'email', name: 'Email' },
    ...CLOUD_SERVICES.filter(s => connectedServices.includes(s.id)).map(s => ({ id: s.id, name: s.name })),
  ]

  const handleCreate = () => {
    if (!newDest) return
    const schedule: ExportSchedule = {
      id: crypto.randomUUID(),
      templateId: newTemplate,
      frequency: newFreq,
      destination: newDest,
      enabled: true,
      lastRun: null,
      nextRun: computeNextRun(newFreq),
    }
    saveSchedule(schedule)
    setSchedules(prev => [...prev, schedule])
    setShowNew(false)
    setNewDest('')
    onToast('Export schedule created')
  }

  const handleToggle = (id: string) => {
    setSchedules(prev => prev.map(s => {
      if (s.id !== id) return s
      const updated = { ...s, enabled: !s.enabled }
      saveSchedule(updated)
      return updated
    }))
  }

  const handleDelete = (id: string) => {
    deleteSchedule(id)
    setSchedules(prev => prev.filter(s => s.id !== id))
    onToast('Schedule removed')
  }

  const getTemplateName = (id: string) => EXPORT_TEMPLATES.find(t => t.id === id)?.name ?? id
  const getDestName = (id: string) => [...CLOUD_SERVICES, { id: 'email', name: 'Email', icon: '', color: '', description: '' }].find(s => s.id === id)?.name ?? id

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Automated Exports</h3>
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          {showNew ? 'Cancel' : '+ New Schedule'}
        </button>
      </div>

      {/* New schedule form */}
      {showNew && (
        <div className="p-4 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 space-y-3">
          <div>
            <label htmlFor="sched-template" className="text-xs text-slate-500 mb-1 block">Template</label>
            <select
              id="sched-template"
              value={newTemplate}
              onChange={e => setNewTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {EXPORT_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-2 block">Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCIES.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setNewFreq(f.value)}
                  className={`p-2 rounded-lg border-2 text-center transition-colors ${
                    newFreq === f.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm font-medium text-slate-900 block">{f.label}</span>
                  <span className="text-xs text-slate-400">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="sched-dest" className="text-xs text-slate-500 mb-1 block">Destination</label>
            <select
              id="sched-dest"
              value={newDest}
              onChange={e => setNewDest(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select destination...</option>
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {connectedServices.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Connect a cloud service in the Connect tab for more options.</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={!newDest}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            Create Schedule
          </button>
        </div>
      )}

      {/* Existing schedules */}
      {schedules.length === 0 && !showNew ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">⏰</div>
          <p className="text-sm text-slate-500">No scheduled exports yet</p>
          <p className="text-xs text-slate-400 mt-1">Set up automatic exports to never miss a report</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map(s => (
            <div
              key={s.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                s.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{getTemplateName(s.templateId)}</span>
                  <span className="text-xs text-slate-400">{s.frequency}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  To {getDestName(s.destination)} | Next: {new Date(s.nextRun).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(s.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  s.enabled ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
                role="switch"
                aria-checked={s.enabled}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  s.enabled ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Delete schedule"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}