'use client'

import { CheckCircle2, AlertCircle } from 'lucide-react'

interface ConversionDiagnosticProps {
  data: Array<{
    etapa: string
    taxaReal: number
    meta: number
    status: 'dentro' | 'abaixo'
  }>
}

export default function ConversionDiagnostic({ data }: ConversionDiagnosticProps) {
  return (
    <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-6 border border-[rgba(199,157,69,0.2)] shadow-lg">
      <h3 className="text-lg font-bold text-[rgba(255,255,255,0.95)] mb-6">Diagnóstico de Conversão</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(199,157,69,0.2)]">
              <th className="text-left py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Etapa</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Taxa Real</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Meta</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-[rgba(255,255,255,0.7)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-[rgba(199,157,69,0.1)] last:border-b-0">
                <td className="py-3 px-4 text-sm text-[rgba(255,255,255,0.7)]">
                  {item.etapa}
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium text-[rgba(255,255,255,0.95)]">
                  {item.taxaReal.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-sm text-right text-[rgba(255,255,255,0.6)]">
                  {item.meta}%
                </td>
                <td className="py-3 px-4 text-center">
                  {item.status === 'dentro' ? (
                    <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-medium">
                      <CheckCircle2 size={14} />
                      Dentro da Meta
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-medium">
                      <AlertCircle size={14} />
                      Abaixo da Meta
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
