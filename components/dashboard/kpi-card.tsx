import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  iconBg: string
  iconColor: string
}

export function KPICard({ title, value, change, changeType, icon, iconBg, iconColor }: KPICardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Icon */}
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-4', iconBg)}>
        <span className={cn('flex items-center justify-center', iconColor)}>
          {icon}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-900 tracking-tight mb-3">{value}</p>

      {/* Change Badge */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold',
            changeType === 'positive' && 'bg-green-50 text-green-700',
            changeType === 'negative' && 'bg-red-50 text-red-700',
            changeType === 'neutral' && 'bg-gray-100 text-gray-600'
          )}
        >
          {changeType === 'positive' && '↑'}
          {changeType === 'negative' && '↓'}
          {change}
        </span>
        <span className="text-xs text-gray-400">vs last month</span>
      </div>
    </div>
  )
}
