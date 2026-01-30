'use client'

interface PerformanceTablesProps {
  responsaveis: Array<{
    nome: string
    leads: number
    vendas: number
    convFinal: number
  }>
  campanhas: Array<{
    campanha: string
    investimento: number
    leads: number
    cpl: number
  }>
}

export default function PerformanceTables({ responsaveis, campanhas }: PerformanceTablesProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Volume por Responsável */}
      <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-6 border border-[rgba(199,157,69,0.2)] shadow-lg">
        <h3 className="text-lg font-bold text-[rgba(255,255,255,0.95)] mb-4">Volume por Responsável</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(199,157,69,0.2)]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Nome</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Leads</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Vendas</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Conv. Final</th>
              </tr>
            </thead>
            <tbody>
              {responsaveis.map((resp, index) => (
                <tr key={index} className="border-b border-[rgba(199,157,69,0.1)] last:border-b-0">
                  <td className="py-3 px-4 text-sm text-[rgba(255,255,255,0.7)]">{resp.nome}</td>
                  <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.95)]">{resp.leads || '-'}</td>
                  <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.95)]">{resp.vendas || '-'}</td>
                  <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.95)]">
                    {resp.convFinal ? `${resp.convFinal.toFixed(1)}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Desempenho por Campanha */}
      <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-6 border border-[rgba(199,157,69,0.2)] shadow-lg">
        <h3 className="text-lg font-bold text-[rgba(255,255,255,0.95)] mb-4">Desempenho por Campanha</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(199,157,69,0.2)]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Campanha</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Investimento</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Leads</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">CPL</th>
              </tr>
            </thead>
            <tbody>
              {campanhas.map((camp, index) => (
                <tr key={index} className="border-b border-[rgba(199,157,69,0.1)] last:border-b-0">
                  <td className="py-3 px-4 text-sm text-[rgba(255,255,255,0.7)]">{camp.campanha}</td>
                  <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.95)]">
                    {formatCurrency(camp.investimento)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.95)]">{camp.leads || '-'}</td>
                  <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.95)]">
                    {formatCurrency(camp.cpl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
