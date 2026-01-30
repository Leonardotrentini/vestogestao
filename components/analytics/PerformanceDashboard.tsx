'use client'

import { useState, useEffect } from 'react'
import { Settings, Filter, BarChart3 } from 'lucide-react'
import PerformanceScorecard from './PerformanceScorecard'
import FunnelChart from './FunnelChart'
import ConversionDiagnostic from './ConversionDiagnostic'
import PerformanceTables from './PerformanceTables'
import TopPerformers from './TopPerformers'
import GoogleSheetsConfig from './GoogleSheetsConfig'
import MetasConfigModal from './MetasConfigModal'
import { useToast } from '@/components/common/ToastProvider'

interface PerformanceDashboardProps {
  boardId: string
  workspaceId: string
  spreadsheetId?: string
}

interface DashboardData {
  kpis: {
    cpl: { real: number; meta: number }
    cpql: { real: number; meta: number }
    cpa: { real: number; meta: number }
    cpc: { real: number; meta: number }
    cac: { real: number; meta: number }
  }
  funnel: {
    leads: number
    qualificados: number
    agendamentos: number
    comparecimentos: number
    vendas: number
  }
  conversion: Array<{
    etapa: string
    taxaReal: number
    meta: number
    status: 'dentro' | 'abaixo'
  }>
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

export default function PerformanceDashboard({ boardId, workspaceId, spreadsheetId }: PerformanceDashboardProps) {
  // Inicializar com dados vazios para evitar tela em branco
  const [data, setData] = useState<DashboardData | null>({
    kpis: {
      cpl: { real: 0, meta: 15 },
      cpql: { real: 0, meta: 45 },
      cpa: { real: 0, meta: 120 },
      cpc: { real: 0, meta: 250 },
      cac: { real: 0, meta: 900 }
    },
    funnel: {
      leads: 0,
      qualificados: 0,
      agendamentos: 0,
      comparecimentos: 0,
      vendas: 0
    },
    conversion: [],
    responsaveis: [],
    campanhas: [],
    anuncios: [],
    publicos: []
  })
  const [loading, setLoading] = useState(true)
  const [dateStart, setDateStart] = useState('2025-12-31')
  const [dateEnd, setDateEnd] = useState('2026-01-30')
  const [selectedCampaign, setSelectedCampaign] = useState('Todas Campanhas')
  const [selectedResponsible, setSelectedResponsible] = useState('Todos Responsáveis')
  const [currentSpreadsheetId, setCurrentSpreadsheetId] = useState<string | undefined>(spreadsheetId)
  const [gastosTotal, setGastosTotal] = useState<number | undefined>(undefined)
  const [boardConfigLoaded, setBoardConfigLoaded] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [showMetasModal, setShowMetasModal] = useState(false)
  const [showSheetsConfig, setShowSheetsConfig] = useState(false)
  const { showError } = useToast()

  // Carregar configurações do board (gastosTotal) - PRIMEIRO, antes de carregar dados
  useEffect(() => {
    const loadBoardConfig = async () => {
      try {
        console.log('🔄 Carregando configurações do board...')
        const response = await fetch(`/api/boards/${boardId}`)
        if (response.ok) {
          const boardData = await response.json()
          console.log('📦 Board data recebido:', boardData)
          if (boardData.content) {
            try {
              const content = typeof boardData.content === 'string' 
                ? JSON.parse(boardData.content) 
                : boardData.content
              console.log('📦 Board content parseado:', content)
              
              if (content.gastosTotal !== undefined && content.gastosTotal !== null) {
                setGastosTotal(content.gastosTotal)
                console.log('✅ Gastos_Total carregado do board e definido no estado:', content.gastosTotal)
              } else {
                console.warn('⚠️ gastosTotal não encontrado no board content')
              }
              
              if (content.spreadsheetId) {
                if (!currentSpreadsheetId) {
                  setCurrentSpreadsheetId(content.spreadsheetId)
                  console.log('✅ SpreadsheetId carregado do board:', content.spreadsheetId)
                }
              }
            } catch (e) {
              console.error('❌ Erro ao parsear board content:', e)
            }
          } else {
            console.warn('⚠️ Board não tem content')
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Erro ao buscar board:', errorData)
        }
      } catch (error) {
        console.error('❌ Erro ao carregar configurações do board:', error)
      } finally {
        // Marcar que a configuração foi carregada, mesmo se falhar
        setBoardConfigLoaded(true)
        console.log('✅ Board config carregado (ou falhou, mas marcado como carregado)')
      }
    }
    loadBoardConfig()
  }, [boardId])

  // Carregar dados APENAS depois que a configuração do board foi carregada (apenas uma vez)
  useEffect(() => {
    if (!boardConfigLoaded) {
      console.log('⏳ Aguardando carregamento da configuração do board...')
      return
    }
    
    console.log('🔄 Carregando dados após configurações do board...', { gastosTotal, currentSpreadsheetId, boardConfigLoaded })
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardConfigLoaded])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Iniciando carregamento de dados...')
      
      // Se tiver spreadsheetId, buscar dados reais do Google Sheets
      if (currentSpreadsheetId) {
        console.log('📊 Planilha conectada, buscando dados reais...')
        const params = new URLSearchParams({
          spreadsheetId: currentSpreadsheetId,
          ...(dateStart && { dateStart }),
          ...(dateEnd && { dateEnd }),
          ...(selectedCampaign !== 'Todas Campanhas' && { campaign: selectedCampaign }),
          ...(selectedResponsible !== 'Todos Responsáveis' && { responsible: selectedResponsible }),
        })
        
        // Adicionar gastosTotal se existir (sempre como string)
        if (gastosTotal !== undefined && gastosTotal !== null && gastosTotal > 0) {
          params.append('gastosTotal', gastosTotal.toString())
        }

        console.log('🔍 Parâmetros da requisição:', {
          spreadsheetId: currentSpreadsheetId,
          gastosTotal,
          dateStart,
          dateEnd,
          campaign: selectedCampaign,
          responsible: selectedResponsible
        })

        const response = await fetch(`/api/dashboard/google-sheets?${params}`)
        if (response.ok) {
          const realData = await response.json()
          console.log('📊 Dados recebidos do dashboard:', realData)
          console.log('💰 KPIs recebidos:', realData.kpis)
          console.log('📈 Valores dos KPIs:', {
            cpl: realData.kpis?.cpl?.real,
            cpql: realData.kpis?.cpql?.real,
            cpa: realData.kpis?.cpa?.real,
            cpc: realData.kpis?.cpc?.real,
            cac: realData.kpis?.cac?.real,
          })
          setData(realData)
          return
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Erro ao buscar dados do Google Sheets:', errorData)
          showError('Erro ao conectar com Google Sheets. Verifique as configurações.')
        }
      }

      // Se não tiver planilha, usar dados mockados
      console.log('⚠️ Nenhuma planilha conectada, usando dados mockados')
      const mockData: DashboardData = {
        kpis: {
          cpl: { real: 35.66, meta: 15.00 },
          cpql: { real: 110.87, meta: 45.00 },
          cpa: { real: 251.73, meta: 120.00 },
          cpc: { real: 356.62, meta: 250.00 },
          cac: { real: 1645.92, meta: 900.00 }
        },
        funnel: {
          leads: 600,
          qualificados: 193,
          agendamentos: 85,
          comparecimentos: 60,
          vendas: 13
        },
        conversion: [
          { etapa: 'Qualificação', taxaReal: 32.2, meta: 30, status: 'dentro' },
          { etapa: 'Agendamento', taxaReal: 44, meta: 40, status: 'dentro' },
          { etapa: 'Comparecimento', taxaReal: 70.6, meta: 60, status: 'dentro' },
          { etapa: 'Fechamento', taxaReal: 21.7, meta: 25, status: 'abaixo' }
        ],
        responsaveis: [
          { nome: 'João Silva', leads: 0, vendas: 0, convFinal: 0 },
          { nome: 'Maria Oliveira', leads: 0, vendas: 0, convFinal: 0 },
          { nome: 'Carlos Souza', leads: 0, vendas: 0, convFinal: 0 },
          { nome: 'Ana Pereira', leads: 0, vendas: 0, convFinal: 0 }
        ],
        campanhas: [
          { campanha: 'Verão 2024', investimento: 5239, leads: 0, cpl: 36.13 },
          { campanha: 'Retargeting Oferta', investimento: 5276, leads: 0, cpl: 34.48 },
          { campanha: 'Institucional Brand', investimento: 5511, leads: 0, cpl: 36.02 },
          { campanha: 'Lookalike 1%', investimento: 5371, leads: 0, cpl: 36.05 }
        ],
        anuncios: [],
        publicos: []
      }
      setData(mockData)
      console.log('✅ Dados mockados carregados')
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error)
      showError(error?.message || 'Erro ao carregar dados do dashboard')
      // Garantir que sempre tenha dados para não quebrar a UI
      setData({
        kpis: {
          cpl: { real: 0, meta: 15 },
          cpql: { real: 0, meta: 45 },
          cpa: { real: 0, meta: 120 },
          cpc: { real: 0, meta: 250 },
          cac: { real: 0, meta: 900 }
        },
        funnel: {
          leads: 0,
          qualificados: 0,
          agendamentos: 0,
          comparecimentos: 0,
          vendas: 0
        },
        conversion: [],
        responsaveis: [],
        campanhas: [],
        anuncios: [],
        publicos: []
      })
    } finally {
      setLoading(false)
      console.log('✅ Carregamento concluído')
    }
  }

  const handleConfigureMetas = () => {
    setShowMetasModal(true)
  }

  const handleConnectSheets = (newSpreadsheetId: string) => {
    setCurrentSpreadsheetId(newSpreadsheetId || undefined)
    if (newSpreadsheetId) {
      setShowSheetsConfig(false)
    }
  }

  const handleSaveMetas = async () => {
    // Recarregar configurações do board e dados após salvar metas
    console.log('🔄 Recarregando dados após salvar metas...')
    
    // Recarregar configurações do board
    try {
      const response = await fetch(`/api/boards/${boardId}`)
      if (response.ok) {
        const boardData = await response.json()
        console.log('📦 Board data recebido:', boardData)
        if (boardData.content) {
          try {
            const content = typeof boardData.content === 'string' 
              ? JSON.parse(boardData.content) 
              : boardData.content
            console.log('📦 Board content parseado:', content)
            if (content.gastosTotal !== undefined && content.gastosTotal !== null) {
              setGastosTotal(content.gastosTotal)
              console.log('✅ Gastos_Total atualizado no estado:', content.gastosTotal)
            } else {
              console.warn('⚠️ gastosTotal não encontrado no board content')
            }
          } catch (e) {
            console.error('❌ Erro ao parsear board content:', e)
          }
        } else {
          console.warn('⚠️ Board não tem content')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Erro ao buscar board:', errorData)
      }
    } catch (error) {
      console.error('❌ Erro ao recarregar configurações do board:', error)
    }
    
    // Aguardar um pouco para garantir que o estado foi atualizado
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Recarregar dados do dashboard
    loadData()
  }
  
  const handleRefresh = () => {
    console.log('🔄 Refresh manual acionado')
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C79D45]"></div>
        <p className="ml-4 text-[rgba(255,255,255,0.7)]">Carregando dashboard...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-[rgba(255,255,255,0.7)] mb-4">Erro ao carregar dados do dashboard</p>
          <button
            onClick={() => loadData()}
            className="px-4 py-2 bg-[#C79D45] text-[#0F1711] rounded-lg hover:bg-[#D4AD5F] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F1711]" style={{ backgroundImage: 'radial-gradient(at 0% 0%, rgba(199, 157, 69, 0.08) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(33, 47, 35, 0.2) 0%, transparent 50%)' }}>
      {/* Header */}
      <div className="bg-[#1A2A1D] border-b border-[rgba(199,157,69,0.2)] px-6 py-4 flex items-center justify-between backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[rgba(199,157,69,0.15)] rounded-lg flex items-center justify-center border border-[rgba(199,157,69,0.3)]">
              <BarChart3 size={20} className="text-[#C79D45]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[rgba(255,255,255,0.95)]">Dashboard de Performance</h1>
              <p className="text-sm text-[rgba(255,255,255,0.5)] mt-0.5">Funil de Vendas: Real vs. Meta</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="bg-[rgba(199,157,69,0.2)] hover:bg-[rgba(199,157,69,0.3)] text-[rgba(255,255,255,0.9)] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium border border-[rgba(199,157,69,0.3)]"
            title="Atualizar dados"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Atualizar
          </button>
          <button
            onClick={handleConfigureMetas}
            className="bg-[#C79D45] hover:bg-[#D4AD5F] text-[#0F1711] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-[0_4px_16px_rgba(199,157,69,0.25)]"
          >
            <Settings size={18} />
            Configurar Metas
          </button>
        </div>
      </div>

      {/* Configuração do Google Sheets */}
      {showSheetsConfig && (
        <div className="bg-[rgba(26,42,29,0.7)] border-b border-[rgba(199,157,69,0.2)] px-6 py-4 backdrop-blur-xl">
          <GoogleSheetsConfig
            boardId={boardId}
            onConnect={handleConnectSheets}
            currentSpreadsheetId={currentSpreadsheetId}
          />
        </div>
      )}

      {/* Modal de Configuração de Metas */}
      <MetasConfigModal
        isOpen={showMetasModal}
        onClose={() => setShowMetasModal(false)}
        boardId={boardId}
        spreadsheetId={currentSpreadsheetId}
        gastosTotal={gastosTotal}
        currentMetas={data ? {
          financeiras: {
            cpl: data.kpis.cpl.meta,
            cpql: data.kpis.cpql.meta,
            cpa: data.kpis.cpa.meta,
            cpc: data.kpis.cpc.meta,
            cac: data.kpis.cac.meta,
          },
          conversao: {
            qualificacao: data.conversion[0]?.meta || 30,
            agendamento: data.conversion[1]?.meta || 40,
            comparecimento: data.conversion[2]?.meta || 60,
            fechamento: data.conversion[3]?.meta || 25,
          }
        } : undefined}
        onSave={handleSaveMetas}
      />

      {/* Filtros */}
      <div className="bg-[rgba(26,42,29,0.7)] border-b border-[rgba(199,157,69,0.2)] px-6 py-3 flex items-center gap-4 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[rgba(255,255,255,0.7)]">
          <Filter size={18} />
          <span className="font-medium">Filtros:</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-3 py-2 text-sm text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
          />
          <span className="text-[rgba(255,255,255,0.5)]">até</span>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-3 py-2 text-sm text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
          />
        </div>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-3 py-2 text-sm text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
        >
          <option>Todas Campanhas</option>
        </select>
        <select
          value={selectedResponsible}
          onChange={(e) => setSelectedResponsible(e.target.value)}
          className="bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-3 py-2 text-sm text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
        >
          <option>Todos Responsáveis</option>
        </select>
      </div>

      {/* Scorecards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <PerformanceScorecard
            title="CPL"
            subtitle="CUSTO/LEAD"
            real={data.kpis.cpl.real}
            meta={data.kpis.cpl.meta}
          />
          <PerformanceScorecard
            title="CPQL"
            subtitle="LEAD QUALIF."
            real={data.kpis.cpql.real}
            meta={data.kpis.cpql.meta}
          />
          <PerformanceScorecard
            title="CPA"
            subtitle="AGENDAMENTO"
            real={data.kpis.cpa.real}
            meta={data.kpis.cpa.meta}
          />
          <PerformanceScorecard
            title="CPC"
            subtitle="COMPARECIMENTO"
            real={data.kpis.cpc.real}
            meta={data.kpis.cpc.meta}
          />
          <PerformanceScorecard
            title="CAC"
            subtitle="CUSTO/VENDA"
            real={data.kpis.cac.real}
            meta={data.kpis.cac.meta}
          />
        </div>

        {/* Gráficos e Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FunnelChart data={data.funnel} />
          <ConversionDiagnostic data={data.conversion} />
        </div>

        {/* Tabelas */}
        <PerformanceTables
          responsaveis={data.responsaveis}
          campanhas={data.campanhas}
        />

        {/* Anúncios e Públicos Campeões */}
        <TopPerformers
          anuncios={data.anuncios || []}
          publicos={data.publicos || []}
        />
      </div>
    </div>
  )
}
