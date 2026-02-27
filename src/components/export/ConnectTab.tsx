'use client'

import { useState, useEffect } from 'react'
import {
  CLOUD_SERVICES,
  getConnectedServices,
  toggleServiceConnection,
  simulateCloudExport,
} from '@/lib/export-cloud'

interface Props {
  onToast: (msg: string) => void
}

export default function ConnectTab({ onToast }: Props) {
  const [connected, setConnected] = useState<string[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    setConnected(getConnectedServices())
  }, [])

  const handleToggle = async (serviceId: string) => {
    const isConnected = connected.includes(serviceId)
    if (isConnected) {
      toggleServiceConnection(serviceId)
      setConnected(prev => prev.filter(s => s !== serviceId))
      onToast(`Disconnected from ${CLOUD_SERVICES.find(s => s.id === serviceId)?.name}`)
      return
    }
    setConnecting(serviceId)
    await simulateCloudExport(serviceId, '', 2000)
    const nowConnected = toggleServiceConnection(serviceId)
    setConnecting(null)
    if (nowConnected) {
      setConnected(prev => [...prev, serviceId])
      onToast(`Connected to ${CLOUD_SERVICES.find(s => s.id === serviceId)?.name}`)
    }
  }

  const handleSync = async (serviceId: string) => {
    setSyncing(serviceId)
    await simulateCloudExport(serviceId, '', 2500)
    setSyncing(null)
    onToast(`Synced with ${CLOUD_SERVICES.find(s => s.id === serviceId)?.name}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Integrations</h3>
        <span className="text-xs text-slate-400">
          {connected.length} of {CLOUD_SERVICES.length} connected
        </span>
      </div>

      <div className="space-y-2">
        {CLOUD_SERVICES.map(service => {
          const isConnected = connected.includes(service.id)
          const isConnecting = connecting === service.id
          const isSyncing = syncing === service.id

          return (
            <div
              key={service.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isConnected ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200'
              }`}
            >
              <div className={`h-10 w-10 rounded-xl ${service.color} flex items-center justify-center text-white text-lg shrink-0 shadow-sm`}>
                {service.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{service.name}</span>
                  {isConnected && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{service.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isConnected && (
                  <button
                    type="button"
                    onClick={() => handleSync(service.id)}
                    disabled={isSyncing}
                    className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <span className="inline-flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Syncing
                      </span>
                    ) : 'Sync'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleToggle(service.id)}
                  disabled={isConnecting}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isConnected
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : isConnecting
                        ? 'text-slate-400 bg-slate-100'
                        : 'text-white bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {isConnecting ? (
                    <span className="inline-flex items-center gap-1">
                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Connecting
                    </span>
                  ) : isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* OAuth simulation note */}
      <p className="text-xs text-slate-400 text-center px-4">
        Connections are simulated for demo purposes. In production, each service would use OAuth 2.0 for secure authorization.
      </p>
    </div>
  )
}
