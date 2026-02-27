interface Props {
  title: string
  value: string
  subtitle?: string
  icon: string
  accent?: boolean
}

export default function SummaryCard({ title, value, subtitle, icon, accent }: Props) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 flex items-start gap-4 ${accent ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200'}`}>
      <div aria-hidden="true" className={`text-3xl p-2 rounded-lg ${accent ? 'bg-indigo-100' : 'bg-slate-100'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className={`text-2xl font-bold truncate ${accent ? 'text-indigo-600' : 'text-slate-900'}`}>
          {value}
        </p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
