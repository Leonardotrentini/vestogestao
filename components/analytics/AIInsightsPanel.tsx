'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/common/ToastProvider'

interface AIInsight {
  id: string
  insight_type: string
  content: string
  created_at: string
  ai_model?: string
}

interface AIInsightsPanelProps {
  workspaceId?: string
  userId?: string
  entityId?: string
}

export default function AIInsightsPanel({ workspaceId, userId, entityId }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    loadInsights()
  }, [workspaceId, userId, entityId])

  const loadInsights = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (workspaceId) params.append('workspaceId', workspaceId)
      if (userId) params.append('userId', userId)
      if (entityId) params.append('entityId', entityId)

      const response = await fetch(`/api/analytics/insights?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setInsights(data.insights || [])
      } else {
        showError('Erro ao carregar insights')
      }
    } catch (error) {
      console.error('Erro ao carregar insights:', error)
      showError('Erro ao carregar insights')
    } finally {
      setLoading(false)
    }
  }

  const generateInsight = async () => {
    try {
      setGenerating(true)
      const response = await fetch('/api/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insightType: 'weekly_summary',
          entityId: entityId || userId || workspaceId
        })
      })

      const data = await response.json()

      if (response.ok) {
        showSuccess('Insight gerado com sucesso!')
        loadInsights()
      } else {
        showError('Erro ao gerar insight')
      }
    } catch (error) {
      console.error('Erro ao gerar insight:', error)
      showError('Erro ao gerar insight')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="bg-[#1A2A1D] rounded-lg border border-[rgba(199,157,69,0.3)] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#C79D45]" size={20} />
          <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)]">
            Insights de IA
          </h3>
        </div>
        <button
          onClick={generateInsight}
          disabled={generating}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#C79D45] text-[#0F1711] rounded-lg hover:bg-[#D4AD5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Gerar Insight
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-[#C79D45]" size={24} />
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="mx-auto text-[rgba(255,255,255,0.3)] mb-2" size={48} />
          <p className="text-[rgba(255,255,255,0.7)] mb-2">
            Nenhum insight disponível
          </p>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">
            Clique em "Gerar Insight" para criar análises inteligentes
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="bg-[rgba(199,157,69,0.05)] rounded-lg p-4 border border-[rgba(199,157,69,0.2)]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#C79D45] font-medium uppercase">
                  {insight.insight_type.replace('_', ' ')}
                </span>
                <span className="text-xs text-[rgba(255,255,255,0.5)]">
                  {new Date(insight.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-sm text-[rgba(255,255,255,0.9)] whitespace-pre-wrap">
                  {insight.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

