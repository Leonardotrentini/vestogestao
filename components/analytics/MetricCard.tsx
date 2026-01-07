'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label: string
  }
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default'
}: MetricCardProps) {
  const variantStyles = {
    default: 'border-[rgba(199,157,69,0.3)] bg-[rgba(199,157,69,0.05)]',
    success: 'border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.05)]',
    warning: 'border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.05)]',
    danger: 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)]'
  }

  const trendColor = trend?.value
    ? trend.value > 0
      ? 'text-green-400'
      : trend.value < 0
      ? 'text-red-400'
      : 'text-[rgba(255,255,255,0.5)]'
    : 'text-[rgba(255,255,255,0.5)]'

  const TrendIcon = trend?.value
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus
    : null

  return (
    <div
      className={`rounded-lg border p-4 transition-all hover:shadow-lg ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm text-[rgba(255,255,255,0.7)] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[rgba(255,255,255,0.95)]">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[rgba(255,255,255,0.5)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 text-[#C79D45]">{icon}</div>
        )}
      </div>

      {trend && TrendIcon && (
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon size={14} />
          <span>
            {trend.value > 0 ? '+' : ''}
            {trend.value.toFixed(1)}% {trend.label}
          </span>
        </div>
      )}
    </div>
  )
}

