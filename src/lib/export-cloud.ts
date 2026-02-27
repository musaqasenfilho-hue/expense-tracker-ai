import type { Expense } from '@/types/expense'
import { CATEGORIES } from '@/types/expense'
import { generateCSV } from '@/lib/csv'
import { getCategoryTotals } from '@/lib/analytics'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExportTemplate {
  id: string
  name: string
  description: string
  icon: string
  gradient: string
  format: 'csv' | 'json' | 'summary'
  filterFn?: (expenses: Expense[]) => Expense[]
  generate: (expenses: Expense[]) => string
}

export interface ExportHistoryEntry {
  id: string
  templateName: string
  format: string
  recordCount: number
  totalAmount: number
  destination: string
  timestamp: string
}

export interface CloudService {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export interface ExportSchedule {
  id: string
  templateId: string
  frequency: 'daily' | 'weekly' | 'monthly'
  destination: string
  enabled: boolean
  lastRun: string | null
  nextRun: string
}

// ---------------------------------------------------------------------------
// Cloud services registry
// ---------------------------------------------------------------------------

export const CLOUD_SERVICES: CloudService[] = [
  { id: 'google-sheets', name: 'Google Sheets', icon: '📊', color: 'bg-emerald-500', description: 'Sync to a spreadsheet in real-time' },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', color: 'bg-blue-500', description: 'Auto-backup to your Dropbox folder' },
  { id: 'onedrive', name: 'OneDrive', icon: '☁️', color: 'bg-sky-500', description: 'Save directly to Microsoft OneDrive' },
  { id: 'notion', name: 'Notion', icon: '📝', color: 'bg-neutral-800', description: 'Create a Notion database from expenses' },
  { id: 'email', name: 'Email', icon: '✉️', color: 'bg-violet-500', description: 'Send reports to any email address' },
  { id: 'slack', name: 'Slack', icon: '💬', color: 'bg-purple-600', description: 'Post summaries to a Slack channel' },
]

// ---------------------------------------------------------------------------
// Export templates
// ---------------------------------------------------------------------------

function generateSummaryReport(expenses: Expense[]): string {
  const totals = getCategoryTotals(expenses)
  const grand = expenses.reduce((s, e) => s + e.amount, 0)
  const lines = [
    'EXPENSE SUMMARY REPORT',
    '='.repeat(40),
    `Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}`,
    `Total Records: ${expenses.length}`,
    `Grand Total: $${(grand / 100).toFixed(2)}`,
    '',
    'BREAKDOWN BY CATEGORY',
    '-'.repeat(40),
  ]
  for (const cat of CATEGORIES) {
    const amt = totals[cat]
    const pct = grand > 0 ? ((amt / grand) * 100).toFixed(1) : '0.0'
    lines.push(`  ${cat.padEnd(18)} $${(amt / 100).toFixed(2).padStart(10)}  (${pct}%)`)
  }

  const sorted = [...expenses].sort((a, b) => b.amount - a.amount)
  lines.push('', 'TOP 5 EXPENSES', '-'.repeat(40))
  for (const e of sorted.slice(0, 5)) {
    lines.push(`  ${e.date}  $${(e.amount / 100).toFixed(2).padStart(8)}  ${e.category.padEnd(16)} ${e.description}`)
  }
  return lines.join('\n')
}

function generateCategoryAnalysis(expenses: Expense[]): string {
  const totals = getCategoryTotals(expenses)
  const grand = expenses.reduce((s, e) => s + e.amount, 0)
  const data = CATEGORIES.map(cat => ({
    category: cat,
    total: totals[cat],
    count: expenses.filter(e => e.category === cat).length,
    percentage: grand > 0 ? (totals[cat] / grand) * 100 : 0,
    avgTransaction: expenses.filter(e => e.category === cat).length > 0
      ? totals[cat] / expenses.filter(e => e.category === cat).length : 0,
  }))
  return JSON.stringify({ generatedAt: new Date().toISOString(), totalExpenses: grand / 100, categories: data.map(d => ({ ...d, total: d.total / 100, avgTransaction: d.avgTransaction / 100 })) }, null, 2)
}

export const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'full-export',
    name: 'Full Export',
    description: 'All expense data in spreadsheet format',
    icon: '📋',
    gradient: 'from-indigo-500 to-blue-500',
    format: 'csv',
    generate: (expenses) => generateCSV(expenses),
  },
  {
    id: 'tax-report',
    name: 'Tax Report',
    description: 'Bills & receipts formatted for tax filing',
    icon: '🏛️',
    gradient: 'from-emerald-500 to-teal-500',
    format: 'csv',
    filterFn: (expenses) => expenses.filter(e => e.category === 'Bills' || e.category === 'Transportation'),
    generate: (expenses) => {
      const filtered = expenses.filter(e => e.category === 'Bills' || e.category === 'Transportation')
      return generateCSV(filtered)
    },
  },
  {
    id: 'monthly-summary',
    name: 'Monthly Summary',
    description: 'High-level spending overview with totals',
    icon: '📈',
    gradient: 'from-violet-500 to-purple-500',
    format: 'summary',
    generate: generateSummaryReport,
  },
  {
    id: 'category-analysis',
    name: 'Category Analysis',
    description: 'Deep dive into spending by category',
    icon: '🔍',
    gradient: 'from-amber-500 to-orange-500',
    format: 'json',
    generate: generateCategoryAnalysis,
  },
]

// ---------------------------------------------------------------------------
// Export history (localStorage)
// ---------------------------------------------------------------------------

const HISTORY_KEY = 'expense-export-history'
const SCHEDULES_KEY = 'expense-export-schedules'
const CONNECTIONS_KEY = 'expense-cloud-connections'

export function getExportHistory(): ExportHistoryEntry[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(HISTORY_KEY)
  return raw ? JSON.parse(raw) : []
}

export function addExportHistory(entry: Omit<ExportHistoryEntry, 'id' | 'timestamp'>): ExportHistoryEntry {
  const full: ExportHistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  }
  const history = [full, ...getExportHistory()].slice(0, 50)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  return full
}

export function clearExportHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}

// ---------------------------------------------------------------------------
// Schedules (localStorage)
// ---------------------------------------------------------------------------

export function getSchedules(): ExportSchedule[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(SCHEDULES_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveSchedule(schedule: ExportSchedule): void {
  const all = getSchedules().filter(s => s.id !== schedule.id)
  all.push(schedule)
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(all))
}

export function deleteSchedule(id: string): void {
  const all = getSchedules().filter(s => s.id !== id)
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(all))
}

// ---------------------------------------------------------------------------
// Cloud connections (localStorage)
// ---------------------------------------------------------------------------

export function getConnectedServices(): string[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(CONNECTIONS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function toggleServiceConnection(serviceId: string): boolean {
  const connected = getConnectedServices()
  const idx = connected.indexOf(serviceId)
  if (idx >= 0) {
    connected.splice(idx, 1)
    localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connected))
    return false
  }
  connected.push(serviceId)
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connected))
  return true
}

// ---------------------------------------------------------------------------
// Simulated cloud operations
// ---------------------------------------------------------------------------

export async function simulateCloudExport(
  _serviceId: string,
  _data: string,
  durationMs = 1500,
): Promise<{ success: boolean }> {
  await new Promise(r => setTimeout(r, durationMs))
  return { success: true }
}

// ---------------------------------------------------------------------------
// Share link generation
// ---------------------------------------------------------------------------

export function generateShareId(): string {
  return crypto.randomUUID().slice(0, 8)
}

// ---------------------------------------------------------------------------
// File download helper
// ---------------------------------------------------------------------------

export function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function computeNextRun(frequency: 'daily' | 'weekly' | 'monthly'): string {
  const d = new Date()
  if (frequency === 'daily') d.setDate(d.getDate() + 1)
  else if (frequency === 'weekly') d.setDate(d.getDate() + 7)
  else d.setMonth(d.getMonth() + 1)
  return d.toISOString()
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
