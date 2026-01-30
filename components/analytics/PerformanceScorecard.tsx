'use client'

import { TrendingUp } from 'lucide-react'

interface PerformanceScorecardProps {
  title: string
  subtitle: string
  real: number
  meta: number
}

export default function PerformanceScorecard({
  title,
  subtitle,
  real,
  meta
}: PerformanceScorecardProps) {
  const deviation = ((real - meta) / meta) * 100
  const isAboveMeta = deviation > 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value)
  }

  return (
    <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-6 border border-[rgba(199,157,69,0.2)] shadow-lg hover:border-[rgba(199,157,69,0.4)] transition-all">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[rgba(255,255,255,0.95)]">{title}</h3>
        <p className="text-sm text-[rgba(255,255,255,0.5)]">{subtitle}</p>
      </div>
      
      <div className="mb-3">
        <div className="text-3xl font-bold text-[rgba(255,255,255,0.95)] mb-1">
          {formatCurrency(real)}
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded text-xs font-medium border ${
            isAboveMeta 
              ? 'bg-red-500/20 text-red-400 border-red-500/30' 
              : 'bg-green-500/20 text-green-400 border-green-500/30'
          }`}>
            Meta: {formatCurrency(meta)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {isAboveMeta ? (
          <TrendingUp className="text-red-400" size={16} />
        ) : (
          <TrendingUp className="text-green-400 rotate-180" size={16} />
        )}
        <span className={`text-sm font-medium ${
          isAboveMeta ? 'text-red-400' : 'text-green-400'
        }`}>
          {isAboveMeta ? '↑' : '↓'}{Math.abs(deviation).toFixed(1)}% vs meta
        </span>
      </div>
    </div>
  )
}
