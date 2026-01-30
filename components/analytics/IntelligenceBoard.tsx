'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Users, 
  Target,
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react'
import MetricCard from './MetricCard'
import UserPerformanceChart from './UserPerformanceChart'
import PerformanceRanking from './PerformanceRanking'
import TrendChart from './TrendChart'
import AIInsightsPanel from './AIInsightsPanel'
import { useToast } from '@/components/common/ToastProvider'

interface IntelligenceBoardProps {
  workspaceId: string
  userId?: string
}

export default function IntelligenceBoard({ workspaceId, userId }: IntelligenceBoardProps) {
  const [kpis, setKpis] = useState<any>(null)
  const [userPerformance, setUserPerformance] = useState<any>(null)
  const [userRanking, setUserRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly')
  const { showError } = useToast()

  useEffect(() => {
    loadData()
  }, [workspaceId, userId, period])

  const loadData = async () => {
    try {
      setLoading(true)

      // Carregar KPIs da empresa
      const kpisResponse = await fetch(
        `/api/analytics/company-kpis?workspaceId=${workspaceId}&period=${period}`
      )
      const kpisData = await kpisResponse.json()
      if (kpisResponse.ok) {
        setKpis(kpisData)
      }

      // Carregar performance individual se userId fornecido
      if (userId) {
        const perfResponse = await fetch(
          `/api/analytics/user-performance?userId=${userId}&period=${period}`
        )
        const perfData = await perfResponse.json()
        if (perfResponse.ok) {
          setUserPerformance(perfData)
        }
      }

      // TODO: Carregar ranking de usuários
      // Por enquanto, vamos criar um placeholder
      setUserRanking([])

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      showError('Erro ao carregar dados de analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculate = async () => {
    try {
      setLoading(true)
      await fetch('/api/analytics/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metricType: userId ? 'user_performance' : 'company_kpi',
          entityId: userId || workspaceId,
          workspaceId: workspaceId,
          periodType: period
        })
      })
      loadData()
    } catch (error) {
      console.error('Erro ao recalcular:', error)
      showError('Erro ao recalcular métricas')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !kpis && !userPerformance) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#C79D45]" size={32} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-[#0F1711] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgba(255,255,255,0.95)] mb-1">
            📊 Quadro de Inteligência
          </h1>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">
            Análise de dados e performance da equipe
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Seletor de período */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 bg-[#1A2A1D] border border-[rgba(199,157,69,0.3)] rounded-lg text-sm text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45]"
          >
            <option value="daily">Hoje</option>
            <option value="weekly">Última Semana</option>
            <option value="monthly">Este Mês</option>
            <option value="quarterly">Este Trimestre</option>
          </select>

          <button
            onClick={handleRecalculate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#C79D45] text-[#0F1711] rounded-lg hover:bg-[#D4AD5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Recalcular
          </button>
        </div>
      </div>

      {/* KPIs Cards */}
      {kpis?.kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Tarefas Completadas"
            value={`${kpis.kpis.completedTasks}/${kpis.kpis.totalTasks}`}
            subtitle={`${kpis.kpis.overallCompletionRate.toFixed(1)}% de conclusão`}
            icon={<CheckCircle2 size={24} />}
            variant="success"
          />
          <MetricCard
            title="Horas Trabalhadas"
            value={`${kpis.kpis.totalHoursTracked.toFixed(1)}h`}
            subtitle="Total registrado"
            icon={<Clock size={24} />}
            variant="default"
          />
          <MetricCard
            title="Projetos Ativos"
            value={kpis.kpis.activeProjects}
            subtitle={`${kpis.kpis.totalProjects} total`}
            icon={<Target size={24} />}
            variant="default"
          />
          <MetricCard
            title="Throughput"
            value={`${kpis.kpis.throughput.toFixed(1)}/dia`}
            subtitle="Tarefas por dia"
            icon={<TrendingUp size={24} />}
            variant="success"
          />
        </div>
      )}

      {/* Performance Individual */}
      {userPerformance?.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Taxa de Conclusão"
            value={`${userPerformance.metrics.completionRate.toFixed(1)}%`}
            subtitle={`${userPerformance.metrics.tasksCompleted} de ${userPerformance.metrics.tasksAssigned} tarefas`}
            variant="success"
          />
          <MetricCard
            title="Tempo Trabalhado"
            value={`${userPerformance.metrics.hoursWorked}h`}
            subtitle={`${userPerformance.metrics.tasksPerHour.toFixed(2)} tarefas/hora`}
            variant="default"
          />
          <MetricCard
            title="Cumprimento de Prazos"
            value={`${userPerformance.metrics.deadlineCompliance.toFixed(1)}%`}
            subtitle={`${userPerformance.metrics.deadlinesMet}/${userPerformance.metrics.deadlinesTotal} prazos`}
            variant={userPerformance.metrics.deadlineCompliance >= 90 ? 'success' : 'warning'}
          />
        </div>
      )}

      {/* Insights de IA */}
      <AIInsightsPanel
        workspaceId={workspaceId}
        userId={userId}
        entityId={userId || workspaceId}
      />

      {/* Gráficos e Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking de Performance */}
        <PerformanceRanking users={userRanking} />

        {/* Gráfico de Tendências (placeholder) */}
        <TrendChart
          data={[
            { period: 'Sem 1', value: 45 },
            { period: 'Sem 2', value: 52 },
            { period: 'Sem 3', value: 48 },
            { period: 'Sem 4', value: 61 }
          ]}
          title="Tendência de Tarefas Completadas"
          dataKey="Tarefas"
        />
      </div>

      {/* Gráfico de Performance da Equipe */}
      {userRanking.length > 0 && (
        <UserPerformanceChart data={userRanking} />
      )}
    </div>
  )
}


