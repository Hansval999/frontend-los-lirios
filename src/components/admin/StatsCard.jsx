export default function StatsCard({ title, value, icon, color = 'primary', subtitle }) {
  const colorMap = {
    primary:  { bg: 'bg-primary-50',  text: 'text-primary-600',  icon: 'bg-primary-100'  },
    accent:   { bg: 'bg-accent-50',   text: 'text-accent-600',   icon: 'bg-accent-100'   },
    blue:     { bg: 'bg-blue-50',     text: 'text-blue-600',     icon: 'bg-blue-100'     },
    amber:    { bg: 'bg-amber-50',    text: 'text-amber-600',    icon: 'bg-amber-100'    },
  }

  const c = colorMap[color] ?? colorMap.primary

  return (
    <div className={`card p-5 ${c.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-muted truncate">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${c.text}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-brand-muted mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${c.icon} rounded-xl p-3 ml-3 shrink-0`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}
