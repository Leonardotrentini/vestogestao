'use client'

interface FunnelChartProps {
  data: {
    leads: number
    qualificados: number
    agendamentos: number
    comparecimentos: number
    vendas: number
  }
}

const stages = [
  { key: 'leads', label: 'Leads Totais', color: 'bg-blue-500' },
  { key: 'qualificados', label: 'Qualificados', color: 'bg-yellow-500' },
  { key: 'agendamentos', label: 'Agendamentos', color: 'bg-orange-500' },
  { key: 'comparecimentos', label: 'Comparecimentos', color: 'bg-green-500' },
  { key: 'vendas', label: 'Vendas', color: 'bg-[#C79D45]' }
]

export default function FunnelChart({ data }: FunnelChartProps) {
  const maxValue = Math.max(
    data.leads,
    data.qualificados,
    data.agendamentos,
    data.comparecimentos,
    data.vendas
  )

  const getValue = (key: string) => {
    switch (key) {
      case 'leads': return data.leads
      case 'qualificados': return data.qualificados
      case 'agendamentos': return data.agendamentos
      case 'comparecimentos': return data.comparecimentos
      case 'vendas': return data.vendas
      default: return 0
    }
  }

  const getPercentage = (value: number) => {
    return (value / maxValue) * 100
  }

  return (
    <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-6 border border-[rgba(199,157,69,0.2)] shadow-lg">
      <h3 className="text-lg font-bold text-[rgba(255,255,255,0.95)] mb-6">Funil de Vendas (Volume)</h3>
      <div className="space-y-4">
        {stages.map((stage) => {
          const value = getValue(stage.key)
          const percentage = getPercentage(value)
          
          return (
            <div key={stage.key} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-[rgba(255,255,255,0.7)]">
                {stage.label}
              </div>
              <div className="flex-1 relative">
                <div
                  className={`${stage.color} h-10 rounded flex items-center justify-end pr-4 transition-all`}
                  style={{ width: `${percentage}%` }}
                >
                  <span className="text-white font-bold text-sm">{value}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
