'use client'

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { useToast } from '@/components/common/ToastProvider'

interface MetasConfigModalProps {
  isOpen: boolean
  onClose: () => void
  boardId: string
  spreadsheetId?: string
  currentMetas?: {
    financeiras: {
      cpl: number
      cpql: number
      cpa: number
      cpc: number
      cac: number
    }
    conversao: {
      qualificacao: number
      agendamento: number
      comparecimento: number
      fechamento: number
    }
  }
  gastosTotal?: number
  onSave?: () => void
}

export default function MetasConfigModal({ 
  isOpen, 
  onClose, 
  boardId,
  spreadsheetId,
  currentMetas,
  gastosTotal: initialGastosTotal,
  onSave 
}: MetasConfigModalProps) {
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Metas Financeiras
  const [metaCPL, setMetaCPL] = useState('15')
  const [metaCPQL, setMetaCPQL] = useState('45')
  const [metaCPA, setMetaCPA] = useState('120')
  const [metaCPC, setMetaCPC] = useState('250')
  const [metaCAC, setMetaCAC] = useState('900')
  
  // Metas de Conversão
  const [metaQualificacao, setMetaQualificacao] = useState('30')
  const [metaAgendamento, setMetaAgendamento] = useState('40')
  const [metaComparecimento, setMetaComparecimento] = useState('60')
  const [metaFechamento, setMetaFechamento] = useState('25')
  
  // Gastos
  const [gastosTotal, setGastosTotal] = useState(initialGastosTotal?.toString() || '0')
  
  // Função para formatar valor em reais
  const formatCurrency = (value: string): string => {
    const numValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue)
  }
  
  // Função para extrair apenas números do valor formatado
  const parseCurrency = (value: string): string => {
    return value.replace(/[^\d.,]/g, '').replace(',', '.')
  }
  
  // Handler para mudança no campo de gastos
  const handleGastosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    // Remover "R$" se o usuário digitar
    const cleanedValue = rawValue.replace(/R\$\s*/gi, '').trim()
    const numericValue = parseCurrency(cleanedValue)
    setGastosTotal(numericValue)
  }
  
  // Valor formatado para exibição (sem R$ duplicado)
  const displayValue = gastosTotal === '0' || gastosTotal === '' 
    ? '' 
    : formatCurrency(gastosTotal).replace('R$', '').trim()

  // Carregar metas atuais quando o modal abrir
  useEffect(() => {
    if (isOpen && currentMetas) {
      setMetaCPL(currentMetas.financeiras.cpl.toString())
      setMetaCPQL(currentMetas.financeiras.cpql.toString())
      setMetaCPA(currentMetas.financeiras.cpa.toString())
      setMetaCPC(currentMetas.financeiras.cpc.toString())
      setMetaCAC(currentMetas.financeiras.cac.toString())
      setMetaQualificacao(currentMetas.conversao.qualificacao.toString())
      setMetaAgendamento(currentMetas.conversao.agendamento.toString())
      setMetaComparecimento(currentMetas.conversao.comparecimento.toString())
      setMetaFechamento(currentMetas.conversao.fechamento.toString())
    }
    if (isOpen && initialGastosTotal) {
      setGastosTotal(initialGastosTotal.toString())
    }
  }, [isOpen, currentMetas, initialGastosTotal])

  const handleSave = async () => {
    try {
      setLoading(true)

      // Garantir que gastosTotal seja um número válido
      const gastosTotalValue = parseFloat(parseCurrency(gastosTotal)) || 0

      // Buscar conteúdo atual do board
      let boardContent: any = {}
      try {
        const boardResponse = await fetch(`/api/boards/${boardId}`)
        if (!boardResponse.ok) {
          const errorData = await boardResponse.json().catch(() => ({}))
          console.warn('⚠️ Erro ao buscar board, criando novo conteúdo:', errorData)
          // Continuar com boardContent vazio se não conseguir buscar
        } else {
          const boardData = await boardResponse.json()
      
          // Parsear conteúdo atual ou criar novo
          try {
            if (boardData.content) {
              boardContent = typeof boardData.content === 'string' 
                ? JSON.parse(boardData.content) 
                : boardData.content
            }
          } catch (parseError) {
            console.warn('⚠️ Erro ao parsear board content, usando objeto vazio:', parseError)
            boardContent = {}
          }
        }
      } catch (fetchError) {
        console.error('❌ Erro ao buscar board:', fetchError)
        // Continuar com boardContent vazio
      }

      // Salvar Gastos_Total no board content
      boardContent.gastosTotal = gastosTotalValue
      if (spreadsheetId) {
        boardContent.spreadsheetId = spreadsheetId
      }

      // Salvar no board
      const saveResponse = await fetch(`/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: JSON.stringify(boardContent),
        }),
      })

      if (!saveResponse.ok) {
        throw new Error('Erro ao salvar configuração')
      }

      showSuccess(`Valor de gastos (R$ ${formatCurrency(gastosTotal)}) salvo com sucesso!`)
      onSave?.()
      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar metas:', error)
      showError(error.message || 'Erro ao salvar valor de gastos')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-[rgba(26,42,29,0.95)] backdrop-blur-xl rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-[rgba(199,157,69,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[rgba(199,157,69,0.2)]">
            <h2 className="text-xl font-bold text-[rgba(255,255,255,0.95)]">
              Configurar Metas [CONFIG]
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgba(199,157,69,0.15)] rounded-lg transition-colors"
            >
              <X size={20} className="text-[rgba(255,255,255,0.7)]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Metas Financeiras */}
            <div>
              <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-4">
                METAS FINANCEIRAS (R$)
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                    Meta CPL (Custo por Lead)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={metaCPL}
                    onChange={(e) => setMetaCPL(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-4 py-2 text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
                    placeholder="R$ 15,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                    Meta CPQL (Custo por Lead Qual.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={metaCPQL}
                    onChange={(e) => setMetaCPQL(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-4 py-2 text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
                    placeholder="R$ 45,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                    Meta CPA (Custo por Agendamento)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={metaCPA}
                    onChange={(e) => setMetaCPA(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-4 py-2 text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
                    placeholder="R$ 120,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                    Meta CPC (Custo por Comparecimento)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={metaCPC}
                    onChange={(e) => setMetaCPC(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-4 py-2 text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
                    placeholder="R$ 250,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                    Meta CAC (Custo Aquisição Cliente)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={metaCAC}
                    onChange={(e) => setMetaCAC(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-4 py-2 text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
                    placeholder="R$ 900,00"
                  />
                </div>
              </div>
            </div>

            {/* Metas de Conversão */}
            <div>
              <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-4">
                METAS DE CONVERSÃO (%)
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                    Meta Qualificação (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={metaQualificacao}
                    onChange={(e) => setMetaQualificacao(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-4 py-2 text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
                    placeholder="30 %"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                    Meta Agendamento (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={metaAgendamento}
                    onChange={(e) => setMetaAgendamento(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-4 py-2 text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
                    placeholder="40 %"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                    Meta Comparecimento (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={metaComparecimento}
                    onChange={(e) => setMetaComparecimento(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-4 py-2 text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
                    placeholder="60 %"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                    Meta Vendas/Fechamento (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={metaFechamento}
                    onChange={(e) => setMetaFechamento(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-4 py-2 text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
                    placeholder="25 %"
                  />
                </div>
              </div>
            </div>

            {/* GASTOS */}
            <div>
              <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-4">
                GASTOS
              </h3>
              <div>
                <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                  Valor Total de Investimento (Meta)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.7)] font-medium">
                    R$
                  </span>
                  <input
                    type="text"
                    value={displayValue}
                    onChange={handleGastosChange}
                    onBlur={(e) => {
                      // Garantir que sempre tenha um valor numérico válido
                      const cleaned = e.target.value.replace(/R\$\s*/gi, '').trim()
                      const numValue = parseCurrency(cleaned)
                      setGastosTotal(numValue || '0')
                    }}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg pl-12 pr-4 py-2 text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
                    placeholder="0,00"
                  />
                </div>
                <p className="mt-2 text-xs text-[rgba(255,255,255,0.5)]">
                  Este valor será usado como base para calcular CPL, CPQL, CPA, CPC e CAC
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[rgba(199,157,69,0.2)]">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-[rgba(0,0,0,0.2)] text-[rgba(255,255,255,0.7)] rounded-lg hover:bg-[rgba(0,0,0,0.3)] hover:text-[rgba(255,255,255,0.95)] transition-colors disabled:opacity-50 border border-[rgba(199,157,69,0.2)]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-[#C79D45] text-[#0F1711] rounded-lg hover:bg-[#D4AD5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-[0_4px_16px_rgba(199,157,69,0.25)]"
            >
              <Save size={18} />
              {loading ? 'Salvando...' : 'Salvar Metas'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
