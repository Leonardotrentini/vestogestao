'use client'

import { useState } from 'react'
import { Upload, Sparkles, CheckCircle2, Loader2, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/common/ToastProvider'
import { ImportBriefing } from '@/types/briefing'

interface IntelligentImportWizardProps {
  workspaceId: string
  onComplete?: (boardId: string) => void
  onCancel?: () => void
}

export default function IntelligentImportWizard({ 
  workspaceId, 
  onComplete, 
  onCancel 
}: IntelligentImportWizardProps) {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'briefing' | 'creating'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [briefing, setBriefing] = useState<ImportBriefing | null>(null)
  const [excelStructure, setExcelStructure] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string>('')
  const { showSuccess, showError } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setError('')
      } else {
        setError('Apenas arquivos Excel (.xlsx, .xls) são suportados')
      }
    }
  }

  const handleAnalyze = async () => {
    if (!file || !description.trim()) {
      setError('Selecione um arquivo e forneça uma descrição')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setStep('analyzing')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', description.trim())

      // Usar versão sem IA (gratuito) por padrão
      // Para usar IA, mude para '/api/ai/analyze-import'
      const useAI = false // Mude para true se quiser usar IA (cobra créditos)
      
      const response = await fetch(useAI ? '/api/ai/analyze-import' : '/api/ai/analyze-import-simple', {
        method: 'POST',
        body: formData,
      })

      let data
      try {
        data = await response.json()
      } catch (e) {
        throw new Error(`Erro ao processar resposta do servidor: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.details || `Erro ${response.status}: ${response.statusText}`
        console.error('Erro da API:', data)
        throw new Error(errorMsg)
      }

      setBriefing(data.briefing)
      setExcelStructure(data.excelStructure)
      setStep('briefing')
      showSuccess('Análise concluída! Revise o briefing abaixo.')

    } catch (err: any) {
      console.error('Erro ao analisar:', err)
      const errorMessage = err.message || 'Erro ao analisar arquivo'
      console.error('Detalhes do erro:', errorMessage)
      
      // Mensagem mais específica
      let userMessage = errorMessage
      if (errorMessage.includes('API Key')) {
        userMessage = 'API Key não configurada. Verifique o arquivo .env.local e reinicie o servidor.'
      } else if (errorMessage.includes('500')) {
        userMessage = 'Erro no servidor. Verifique os logs do terminal para mais detalhes.'
      } else if (errorMessage.includes('429')) {
        userMessage = 'Limite de requisições excedido. Aguarde alguns minutos e tente novamente.'
      }
      
      setError(userMessage)
      setStep('upload')
      showError(`Erro: ${userMessage}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConfirm = async () => {
    if (!briefing || !file) return

    setIsCreating(true)
    setStep('creating')

    try {
      // Ler arquivo novamente para enviar dados
      const XLSX = await import('xlsx')
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][]

      const headers = (jsonData[0] || []).map((h: any) => String(h || '').trim()).filter(h => h)
      const rows = jsonData.slice(1).filter(row => 
        row && row.some((cell: any) => cell && String(cell).trim() !== '')
      )

      const response = await fetch('/api/ai/create-from-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          briefing,
          excelData: {
            headers,
            rows
          },
          boardName: file.name.replace(/\.(xlsx|xls)$/, '')
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar board')
      }

      showSuccess('Board criado com sucesso!')
      
      if (onComplete) {
        onComplete(data.boardId)
      }

    } catch (err: any) {
      console.error('Erro ao criar board:', err)
      setError(err.message || 'Erro ao criar board')
      setStep('briefing')
      showError('Erro ao criar board')
      setIsCreating(false)
    }
  }

  const handleAdjust = () => {
    setStep('upload')
    setBriefing(null)
  }

  if (step === 'upload') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-[#C79D45]" size={24} />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-[rgba(255,255,255,0.95)]">
              Importação Inteligente
            </h3>
            <p className="text-xs text-[rgba(255,255,255,0.6)] mt-1">
              ✨ Versão gratuita (análise automática sem IA) • Para usar IA, configure OPENAI_API_KEY
            </p>
          </div>
        </div>

        {/* Upload de Arquivo */}
        <div>
          <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
            1️⃣ Envie seu arquivo Excel
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[rgba(199,157,69,0.3)] rounded-lg cursor-pointer hover:border-[rgba(199,157,69,0.5)] transition-colors bg-[rgba(199,157,69,0.05)]">
            {file ? (
              <div className="flex items-center gap-3 p-4">
                <FileSpreadsheet className="text-[#C79D45]" size={32} />
                <div>
                  <p className="text-sm font-medium text-[rgba(255,255,255,0.95)]">
                    {file.name}
                  </p>
                  <p className="text-xs text-[rgba(255,255,255,0.5)]">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  className="ml-4 text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="text-[rgba(255,255,255,0.5)]" size={32} />
                <p className="text-sm text-[rgba(255,255,255,0.7)]">
                  Clique para selecionar ou arraste o arquivo aqui
                </p>
                <p className="text-xs text-[rgba(255,255,255,0.5)]">
                  .xlsx ou .xls
                </p>
              </div>
            )}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
            2️⃣ Descreva o que você quer
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Exemplo:&#10;Tenho campanhas de marketing com nome, status (ativa/inativa), orçamento e resultados.&#10;&#10;Quero ver:&#10;- Gráfico de status das campanhas&#10;- Gráfico de orçamento&#10;- Ranking de campanhas por resultados&#10;- Separar por tipo de campanha"
            rows={8}
            className="w-full px-4 py-3 border border-[rgba(199,157,69,0.3)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C79D45] bg-[rgba(0,0,0,0.2)] text-[rgba(255,255,255,0.95)] placeholder:text-[rgba(255,255,255,0.5)] resize-none"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!file || !description.trim() || isAnalyzing}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] rounded-lg hover:from-[#D4AD5F] hover:to-[#E5C485] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                🤖 Analisar com IA
              </>
            )}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-[rgba(0,0,0,0.2)] text-[rgba(255,255,255,0.7)] rounded-lg hover:bg-[rgba(0,0,0,0.3)] transition-all border border-[rgba(199,157,69,0.2)]"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    )
  }

  if (step === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="animate-spin text-[#C79D45]" size={48} />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-2">
            Analisando com IA...
          </h3>
          <p className="text-sm text-[rgba(255,255,255,0.7)]">
            Nossa IA está entendendo seus dados e preparando o briefing
          </p>
        </div>
      </div>
    )
  }

  if (step === 'briefing' && briefing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="text-green-400" size={24} />
          <h3 className="text-xl font-semibold text-[rgba(255,255,255,0.95)]">
            🤖 Briefing Gerado pela IA
          </h3>
        </div>

        {/* Resumo */}
        <div className="bg-[rgba(199,157,69,0.05)] border border-[rgba(199,157,69,0.3)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[#C79D45] mb-2 uppercase">
            ✅ O QUE FOI ENTENDIDO
          </h4>
          <p className="text-sm text-[rgba(255,255,255,0.9)] whitespace-pre-wrap">
            {briefing.summary}
          </p>
        </div>

        {/* Estrutura */}
        <div className="bg-[rgba(199,157,69,0.05)] border border-[rgba(199,157,69,0.3)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[#C79D45] mb-2 uppercase">
            📊 ESTRUTURA SUGERIDA
          </h4>
          <div className="space-y-2">
            <p className="text-sm text-[rgba(255,255,255,0.9)]">
              <strong>Tipo de dados:</strong> {briefing.dataType}
            </p>
            <p className="text-sm text-[rgba(255,255,255,0.9)]">
              <strong>Agrupamento:</strong> {
                briefing.grouping.strategy === 'by_column'
                  ? `Por coluna: "${briefing.grouping.byColumn}"`
                  : `Grupo único: "${briefing.grouping.defaultGroup}"`
              }
            </p>
            <p className="text-sm text-[rgba(255,255,255,0.9)]">
              <strong>Total de colunas:</strong> {briefing.suggestedColumns.length}
            </p>
            <p className="text-sm text-[rgba(255,255,255,0.9)]">
              <strong>Total de linhas:</strong> {excelStructure?.rowCount || 'N/A'}
            </p>
          </div>
        </div>

        {/* Colunas */}
        {briefing.suggestedColumns.length > 0 && (
          <div className="bg-[rgba(199,157,69,0.05)] border border-[rgba(199,157,69,0.3)] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[#C79D45] mb-3 uppercase">
              📋 COLUNAS QUE SERÃO CRIADAS
            </h4>
            <div className="space-y-2">
              {briefing.suggestedColumns.map((col, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C79D45] text-[#0F1711] flex items-center justify-center font-semibold text-xs">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-[rgba(255,255,255,0.95)] font-medium">
                      {col.name}
                    </p>
                    <p className="text-xs text-[rgba(255,255,255,0.5)]">
                      Tipo: {col.type} • {col.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visualizações */}
        {briefing.visualizations.length > 0 && (
          <div className="bg-[rgba(199,157,69,0.05)] border border-[rgba(199,157,69,0.3)] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[#C79D45] mb-3 uppercase">
              📈 VISUALIZAÇÕES QUE SERÃO CRIADAS
            </h4>
            <div className="space-y-3">
              {briefing.visualizations.map((viz, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-2xl">{
                    viz.type === 'pie' ? '📊' :
                    viz.type === 'bar' ? '📊' :
                    viz.type === 'line' ? '📈' :
                    viz.type === 'table' ? '📋' : '📊'
                  }</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[rgba(255,255,255,0.95)]">
                      {viz.title}
                    </p>
                    <p className="text-xs text-[rgba(255,255,255,0.7)]">
                      {viz.description}
                    </p>
                    <p className="text-xs text-[rgba(255,255,255,0.5)] mt-1">
                      Dados: {viz.dataSource}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendações */}
        {briefing.recommendations.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-400 mb-3 uppercase">
              💡 RECOMENDAÇÕES DA IA
            </h4>
            <ul className="space-y-2">
              {briefing.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-[rgba(255,255,255,0.9)] flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleConfirm}
            disabled={isCreating}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] rounded-lg hover:from-[#D4AD5F] hover:to-[#E5C485] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
          >
            {isCreating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                ✅ Confirmar e Criar
              </>
            )}
          </button>
          <button
            onClick={handleAdjust}
            disabled={isCreating}
            className="px-6 py-3 bg-[rgba(0,0,0,0.2)] text-[rgba(255,255,255,0.7)] rounded-lg hover:bg-[rgba(0,0,0,0.3)] transition-all border border-[rgba(199,157,69,0.2)] disabled:opacity-50"
          >
            ✏️ Ajustar Descrição
          </button>
        </div>
      </div>
    )
  }

  if (step === 'creating') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="animate-spin text-[#C79D45]" size={48} />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-2">
            Criando board e visualizações...
          </h3>
          <p className="text-sm text-[rgba(255,255,255,0.7)]">
            Aguarde enquanto configuramos tudo para você
          </p>
        </div>
      </div>
    )
  }

  return null
}

