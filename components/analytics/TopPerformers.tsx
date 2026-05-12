'use client'

import HorizontalScrollRegion from '@/components/common/HorizontalScrollRegion'

interface TopPerformersProps {
  anuncios: Array<{
    anuncio: string
    investimento: number
    leadsQualificados: number
    cpql: number
  }>
  publicos: Array<{
    publico: string
    investimento: number
    leadsQualificados: number
    cpql: number
  }>
}

export default function TopPerformers({ anuncios, publicos }: TopPerformersProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Anúncios Campeões */}
      <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-6 border border-[rgba(199,157,69,0.2)] shadow-lg">
        <h3 className="text-lg font-bold text-[rgba(255,255,255,0.95)] mb-4">
          🏆 Anúncios Campeões
        </h3>
        <p className="text-xs text-[rgba(255,255,255,0.5)] mb-4">
          Top 5 anúncios que mais trouxeram público qualificado
        </p>
        <HorizontalScrollRegion className="overflow-x-auto max-w-full" edgeFadeFrom="rgba(26,42,29,0.98)" compact>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(199,157,69,0.2)]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Anúncio</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Investimento</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Qualificados</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">CPQL</th>
              </tr>
            </thead>
            <tbody>
              {anuncios.length > 0 ? (
                anuncios.map((anuncio, index) => (
                  <tr key={index} className="border-b border-[rgba(199,157,69,0.1)] last:border-b-0">
                    <td className="py-3 px-4 text-sm text-[rgba(255,255,255,0.7)]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#C79D45] flex items-center justify-center text-[#0F1711] text-xs font-bold">
                          {index + 1}
                        </span>
                        {anuncio.anuncio}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.95)]">
                      {formatCurrency(anuncio.investimento)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.95)]">
                      {anuncio.leadsQualificados}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.95)] font-medium">
                      {formatCurrency(anuncio.cpql)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-[rgba(255,255,255,0.5)]">
                    Nenhum anúncio com leads qualificados encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </HorizontalScrollRegion>
      </div>

      {/* Públicos Campeões */}
      <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-6 border border-[rgba(199,157,69,0.2)] shadow-lg">
        <h3 className="text-lg font-bold text-[rgba(255,255,255,0.95)] mb-4">
          👥 Públicos Campeões
        </h3>
        <p className="text-xs text-[rgba(255,255,255,0.5)] mb-4">
          Top 5 públicos que mais trouxeram leads qualificados
        </p>
        <HorizontalScrollRegion className="overflow-x-auto max-w-full" edgeFadeFrom="rgba(26,42,29,0.98)" compact>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(199,157,69,0.2)]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Público</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Investimento</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Qualificados</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">CPQL</th>
              </tr>
            </thead>
            <tbody>
              {publicos.length > 0 ? (
                publicos.map((publico, index) => (
                  <tr key={index} className="border-b border-[rgba(199,157,69,0.1)] last:border-b-0">
                    <td className="py-3 px-4 text-sm text-[rgba(255,255,255,0.7)]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#C79D45] flex items-center justify-center text-[#0F1711] text-xs font-bold">
                          {index + 1}
                        </span>
                        {publico.publico}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.95)]">
                      {formatCurrency(publico.investimento)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.95)]">
                      {publico.leadsQualificados}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.95)] font-medium">
                      {formatCurrency(publico.cpql)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-[rgba(255,255,255,0.5)]">
                    Nenhum público com leads qualificados encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </HorizontalScrollRegion>
      </div>
    </div>
  )
}
