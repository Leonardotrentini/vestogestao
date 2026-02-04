'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Settings, Filter, BarChart3, Workflow } from 'lucide-react'
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
  leads?: Array<Record<string, any>>
  leadsHeaders?: string[]
}

export default function PerformanceDashboard({ boardId, workspaceId, spreadsheetId }: PerformanceDashboardProps) {
  // Inicializar com dados vazios para evitar tela em branco
  const [data, setData] = useState<DashboardData>({
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
    publicos: [],
    leads: [],
    leadsHeaders: []
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline'>('dashboard')
  const [searchLeads, setSearchLeads] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false)
  const [pipelineViewMode, setPipelineViewMode] = useState<'cards' | 'board'>('cards')
  const [isSyncing, setIsSyncing] = useState(false)
  const [hasSyncedData, setHasSyncedData] = useState(false)
  const { showError, showSuccess } = useToast()

  // Verificar se já há dados sincronizados (grupos no board)
  useEffect(() => {
    const checkSyncedData = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: groups } = await supabase
          .from('groups')
          .select('id')
          .eq('board_id', boardId)
          .limit(1)
        
        setHasSyncedData(groups && groups.length > 0)
      } catch (error) {
        console.error('Erro ao verificar dados sincronizados:', error)
      }
    }
    if (boardId) {
      checkSyncedData()
    }
  }, [boardId])

  // Função para formatar número de telefone brasileiro
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return ''
    
    // Remover todos os caracteres não numéricos
    const numbers = phone.replace(/\D/g, '')
    
    // Se tiver 10 ou 11 dígitos (com DDD)
    if (numbers.length === 10 || numbers.length === 11) {
      const ddd = numbers.substring(0, 2)
      const rest = numbers.substring(2)
      
      // Formatar o restante do número
      if (rest.length === 8) {
        // Telefone fixo: (DDD) XXXX-XXXX
        return `(${ddd}) ${rest.substring(0, 4)}-${rest.substring(4)}`
      } else if (rest.length === 9) {
        // Celular: (DDD) 9XXXX-XXXX
        return `(${ddd}) ${rest.substring(0, 5)}-${rest.substring(5)}`
      }
    }
    
    // Se já estiver formatado ou não seguir o padrão, retornar como está
    // Mas tentar limpar formatações estranhas
    const cleaned = phone.replace(/^p:/i, '').trim()
    return cleaned
  }

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
      // Timeout de segurança: se não carregar em 3 segundos, carregar mesmo assim
      const timeout = setTimeout(() => {
        console.warn('⚠️ Timeout ao carregar board config, carregando dados mesmo assim...')
        setBoardConfigLoaded(true)
      }, 3000)
      return () => clearTimeout(timeout)
    }
    
    console.log('🔄 Carregando dados após configurações do board...', { gastosTotal, currentSpreadsheetId, boardConfigLoaded })
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardConfigLoaded])

  // Usar refs para garantir que o polling sempre use os valores mais recentes dos filtros
  const filtersRef = useRef({ dateStart, dateEnd, selectedCampaign, selectedResponsible, gastosTotal, currentSpreadsheetId })
  
  // Atualizar refs sempre que os filtros mudarem
  useEffect(() => {
    filtersRef.current = { dateStart, dateEnd, selectedCampaign, selectedResponsible, gastosTotal, currentSpreadsheetId }
    console.log('📝 Filtros atualizados:', filtersRef.current)
  }, [dateStart, dateEnd, selectedCampaign, selectedResponsible, gastosTotal, currentSpreadsheetId])

  // Atualização automática em tempo real quando há planilha conectada
  useEffect(() => {
    if (!currentSpreadsheetId) return

    console.log('🔄 Configurando atualização automática a cada 30 segundos...')
    
    // Função de carregamento que sempre usa os valores mais recentes dos filtros
    const loadDataWithCurrentFilters = async () => {
      const currentFilters = filtersRef.current
      
      // Não atualizar se não houver planilha conectada
      if (!currentFilters.currentSpreadsheetId) {
        console.log('⏸️ Pulando atualização automática: sem planilha conectada')
        return
      }

      try {
        setIsAutoRefreshing(true)
        console.log('🔄 Atualização automática iniciada com filtros:', {
          dateStart: currentFilters.dateStart,
          dateEnd: currentFilters.dateEnd,
          campaign: currentFilters.selectedCampaign,
          responsible: currentFilters.selectedResponsible,
          gastosTotal: currentFilters.gastosTotal
        })
        
        const params = new URLSearchParams({
          spreadsheetId: currentFilters.currentSpreadsheetId,
          ...(currentFilters.dateStart && { dateStart: currentFilters.dateStart }),
          ...(currentFilters.dateEnd && { dateEnd: currentFilters.dateEnd }),
          ...(currentFilters.selectedCampaign !== 'Todas Campanhas' && { campaign: currentFilters.selectedCampaign }),
          ...(currentFilters.selectedResponsible !== 'Todos Responsáveis' && { responsible: currentFilters.selectedResponsible }),
        })
        
        // Adicionar gastosTotal se existir
        if (currentFilters.gastosTotal !== undefined && currentFilters.gastosTotal !== null && currentFilters.gastosTotal > 0) {
          params.append('gastosTotal', currentFilters.gastosTotal.toString())
        }

        const response = await fetch(`/api/dashboard/google-sheets?${params}`)
        if (response.ok) {
          const realData = await response.json()
          console.log('✅ Dados atualizados com sucesso (auto-refresh)')
          
          setData(realData)
          setLastUpdate(new Date())
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Erro ao buscar dados (auto-refresh):', errorData)
          // Não mostrar erro no toast durante auto-refresh para não incomodar o usuário
        }
      } catch (error: any) {
        console.error('❌ Erro ao carregar dados (auto-refresh):', error)
        // Não mostrar erro no toast durante auto-refresh
      } finally {
        setIsAutoRefreshing(false)
      }
    }
    
    // Não atualizar imediatamente ao conectar (deixar o loadData inicial fazer isso)
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      loadDataWithCurrentFilters()
    }, 30000) // 30 segundos

    return () => {
      clearInterval(interval)
    }
  }, [currentSpreadsheetId])

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
        publicos: [],
        leads: [],
        leadsHeaders: []
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
        publicos: [],
        leads: [],
        leadsHeaders: []
      })
    } finally {
      setLoading(false)
      setLastUpdate(new Date())
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

  const handleSyncToBoard = async () => {
    if (!currentSpreadsheetId) {
      showError('Nenhuma planilha conectada')
      return
    }

    try {
      setIsSyncing(true)
      console.log('🔄 Iniciando sincronização...', { boardId, spreadsheetId: currentSpreadsheetId })
      
      // Adicionar timeout de 60 segundos
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 segundos
      
      const response = await fetch('/api/dashboard/sync-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId,
          spreadsheetId: currentSpreadsheetId,
          groupBy: 'qualificado', // Pode ser 'qualificado', 'status', 'campanha', etc
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        console.error('❌ Erro na resposta:', errorData)
        showError(errorData.error || `Erro ao sincronizar: ${response.statusText}`)
        return
      }

      const result = await response.json()
      console.log('✅ Sincronização concluída:', result)

      if (result.success) {
        showSuccess(`✅ ${result.message}`)
        setHasSyncedData(true)
        // Redirecionar para o quadro completo
        setTimeout(() => {
          window.location.href = `/workspaces/${workspaceId}/boards/${boardId}`
        }, 1500)
      } else {
        showError(result.error || 'Erro ao sincronizar leads')
      }
    } catch (error: any) {
      console.error('❌ Erro ao sincronizar:', error)
      if (error.name === 'AbortError') {
        showError('Tempo limite excedido. A sincronização está demorando muito. Verifique o console para mais detalhes.')
      } else {
        showError(`Erro ao sincronizar leads: ${error.message || 'Erro desconhecido'}`)
      }
    } finally {
      setIsSyncing(false)
    }
  }

  // Sempre renderizar o dashboard, mesmo em loading, para evitar tela em branco
  // O loading será mostrado como overlay

  return (
    <div className="min-h-screen bg-[#0F1711] relative flex flex-col" style={{ backgroundImage: 'radial-gradient(at 0% 0%, rgba(199, 157, 69, 0.08) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(33, 47, 35, 0.2) 0%, transparent 50%)' }}>
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[rgba(15,23,17,0.8)] backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C79D45]"></div>
            <p className="text-[rgba(255,255,255,0.9)] font-medium">Carregando dashboard...</p>
          </div>
        </div>
      )}
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
        currentMetas={{
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
        }}
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
        {/* Botão Pipeline - apenas quando integração estiver ativa */}
        {currentSpreadsheetId && (
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium ml-auto ${
              activeTab === 'pipeline'
                ? 'bg-[#C79D45] hover:bg-[#D4AD5F] text-[#0F1711] shadow-[0_4px_16px_rgba(199,157,69,0.25)]'
                : 'bg-[rgba(199,157,69,0.2)] hover:bg-[rgba(199,157,69,0.3)] text-[rgba(255,255,255,0.9)] border border-[rgba(199,157,69,0.3)]'
            }`}
          >
            <Workflow size={18} />
            Pipeline
          </button>
        )}
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

      {/* Abas - Sempre visíveis */}
      <div className="bg-[rgba(26,42,29,0.7)] border-b border-[rgba(199,157,69,0.2)] px-6 py-2 flex items-center gap-2 backdrop-blur-xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium ${
            activeTab === 'dashboard'
              ? 'bg-[#C79D45] text-[#0F1711] shadow-[0_4px_16px_rgba(199,157,69,0.25)]'
              : 'bg-transparent text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.9)] hover:bg-[rgba(199,157,69,0.1)]'
          }`}
        >
          <BarChart3 size={18} />
          Dashboard
        </button>
        {currentSpreadsheetId && (
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium ${
              activeTab === 'pipeline'
                ? 'bg-[#C79D45] text-[#0F1711] shadow-[0_4px_16px_rgba(199,157,69,0.25)]'
                : 'bg-transparent text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.9)] hover:bg-[rgba(199,157,69,0.1)]'
            }`}
          >
            <Workflow size={18} />
            Pipeline
          </button>
        )}
      </div>

      {/* Conteúdo do Dashboard */}
      {activeTab === 'dashboard' && (
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
      )}

      {/* Conteúdo do Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="px-6 py-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[rgba(255,255,255,0.95)] mb-2 flex items-center gap-2">
                  <Workflow size={28} className="text-[#C79D45]" />
                  CRM - Pipeline de Vendas
                </h2>
                <p className="text-[rgba(255,255,255,0.6)]">
                  {data.leads?.length || 0} leads encontrados na planilha
                  {lastUpdate && (
                    <span className="ml-2 text-xs">
                      • Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                      {isAutoRefreshing && (
                        <span className="ml-2 text-[#C79D45] animate-pulse">Atualizando...</span>
                      )}
                    </span>
                  )}
                </p>
              </div>
              {currentSpreadsheetId && (
                <div className="flex items-center gap-3">
                  {/* Toggle de visualização */}
                  <div className="flex items-center gap-2 bg-[rgba(0,0,0,0.2)] rounded-lg p-1 border border-[rgba(199,157,69,0.2)]">
                    <button
                      onClick={() => setPipelineViewMode('cards')}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        pipelineViewMode === 'cards'
                          ? 'bg-[#C79D45] text-[#0F1711]'
                          : 'text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.9)]'
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => {
                        setPipelineViewMode('board')
                        handleSyncToBoard()
                      }}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        pipelineViewMode === 'board'
                          ? 'bg-[#C79D45] text-[#0F1711]'
                          : 'text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.9)]'
                      }`}
                    >
                      Quadro
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.6)]">
                    {isAutoRefreshing ? (
                      <>
                        <div className="w-2 h-2 bg-[#C79D45] rounded-full animate-pulse"></div>
                        <span>Sincronizando...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Conectado</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsAutoRefreshing(true)
                      loadData()
                    }}
                    disabled={isAutoRefreshing || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-[rgba(199,157,69,0.2)] hover:bg-[rgba(199,157,69,0.3)] text-[rgba(255,255,255,0.9)] rounded-lg transition-colors font-medium border border-[rgba(199,157,69,0.3)] disabled:opacity-50"
                    title="Atualizar dados agora"
                  >
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className={isAutoRefreshing ? 'animate-spin' : ''}
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M3 21v-5h5" />
                    </svg>
                    {isAutoRefreshing ? 'Atualizando...' : 'Atualizar Agora'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {pipelineViewMode === 'board' ? (
            // Visualização de Quadro
            <div className="min-h-screen">
              {hasSyncedData ? (
                <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-6 border border-[rgba(199,157,69,0.2)] text-center">
                  <p className="text-[rgba(255,255,255,0.9)] mb-4">
                    ✅ Leads já sincronizados! O quadro está disponível na visualização normal.
                  </p>
                  <button
                    onClick={() => {
                      // Remover query param para mostrar o quadro (sem recarregar)
                      const url = new URL(window.location.href)
                      url.searchParams.delete('view')
                      const newUrl = url.search ? url.toString() : url.pathname
                      window.location.href = newUrl
                    }}
                    className="px-6 py-3 bg-[#C79D45] hover:bg-[#D4AD5F] text-[#0F1711] rounded-lg font-medium"
                  >
                    Ver Quadro Completo
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-4 bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg border border-[rgba(199,157,69,0.2)]">
                    <p className="text-[rgba(255,255,255,0.7)] text-sm mb-4">
                      Sincronize os leads da planilha para transformá-los em itens do quadro. Depois, você poderá personalizar grupos e colunas como em qualquer outro quadro.
                    </p>
                    {isSyncing ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[#C79D45]">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#C79D45]"></div>
                          <span className="font-medium">Sincronizando leads com o quadro...</span>
                        </div>
                        <div className="text-xs text-[rgba(255,255,255,0.6)]">
                          Isso pode levar alguns segundos. Por favor, aguarde...
                        </div>
                        <div className="w-full bg-[rgba(0,0,0,0.3)] rounded-full h-2 overflow-hidden">
                          <div className="bg-[#C79D45] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleSyncToBoard}
                        disabled={isSyncing}
                        className="px-4 py-2 bg-[#C79D45] hover:bg-[#D4AD5F] text-[#0F1711] rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sincronizar Leads com Quadro
                      </button>
                    )}
                  </div>
                  <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-6 border border-[rgba(199,157,69,0.2)]">
                    <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-3">Como funciona:</h3>
                    <ul className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
                      <li className="flex items-start gap-2">
                        <span className="text-[#C79D45]">1.</span>
                        <span>Clique em "Sincronizar Leads com Quadro" para importar os leads como itens</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C79D45]">2.</span>
                        <span>Os leads serão agrupados automaticamente (ex: Qualificados, Novos)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C79D45]">3.</span>
                        <span>Você poderá criar novos grupos, adicionar colunas e personalizar como quiser</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C79D45]">4.</span>
                        <span>Os dados serão atualizados automaticamente a cada sincronização</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          ) : !currentSpreadsheetId ? (
            <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-8 border border-[rgba(199,157,69,0.2)] shadow-lg text-center">
              <p className="text-[rgba(255,255,255,0.7)] mb-4">
                Conecte uma planilha do Google Sheets para visualizar os leads
              </p>
              <button
                onClick={() => setShowSheetsConfig(true)}
                className="bg-[#C79D45] hover:bg-[#D4AD5F] text-[#0F1711] px-6 py-3 rounded-lg font-medium shadow-[0_4px_16px_rgba(199,157,69,0.25)]"
              >
                Conectar Planilha
              </button>
            </div>
          ) : data.leads && data.leads.length > 0 ? (
            <div className="space-y-4">
              {/* Filtros do CRM */}
              <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-4 border border-[rgba(199,157,69,0.2)]">
                <div className="flex items-center gap-4 flex-wrap">
                  <input
                    type="text"
                    value={searchLeads}
                    onChange={(e) => setSearchLeads(e.target.value)}
                    placeholder="Buscar lead por nome, email, telefone, campanha..."
                    className="flex-1 min-w-[200px] bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-3 py-2 text-sm text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
                  />
                  <span className="text-sm text-[rgba(255,255,255,0.6)]">
                    {data.leads?.filter(lead => {
                      if (!searchLeads) return true
                      const search = searchLeads.toLowerCase()
                      const fullName = (lead['full_name'] || lead['Full Name'] || lead['Full_Name'] || '').toString().toLowerCase()
                      const instagram = (lead['@_do_instagram_da_sua_empresa'] || lead['instagram'] || '').toString().toLowerCase()
                      const phone = (lead['phone_number'] || lead['phone'] || '').toString().toLowerCase()
                      const adName = (lead['ad_name'] || lead['Ad Name'] || '').toString().toLowerCase()
                      const campaignName = (lead['campaign_name'] || lead['Campaign Name'] || '').toString().toLowerCase()
                      return fullName.includes(search) || instagram.includes(search) || phone.includes(search) || adName.includes(search) || campaignName.includes(search)
                    }).length || 0} leads
                  </span>
                </div>
              </div>

              {/* Lista de Leads */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.leads
                  .filter(lead => {
                    if (!searchLeads) return true
                    const search = searchLeads.toLowerCase()
                    const fullName = (lead['full_name'] || lead['Full Name'] || lead['Full_Name'] || '').toString().toLowerCase()
                    const instagram = (lead['@_do_instagram_da_sua_empresa'] || lead['instagram'] || '').toString().toLowerCase()
                    const phone = (lead['phone_number'] || lead['phone'] || '').toString().toLowerCase()
                    const adName = (lead['ad_name'] || lead['Ad Name'] || '').toString().toLowerCase()
                    const campaignName = (lead['campaign_name'] || lead['Campaign Name'] || '').toString().toLowerCase()
                    return fullName.includes(search) || instagram.includes(search) || phone.includes(search) || adName.includes(search) || campaignName.includes(search)
                  })
                  .map((lead, index) => {
                  // Debug: logar todos os campos do primeiro lead para ver o que está disponível
                  if (index === 0) {
                    console.log('🔍 Campos disponíveis no lead:', Object.keys(lead))
                    console.log('🔍 Lead completo:', lead)
                  }
                  
                  // Buscar campos específicos solicitados
                  const fullName = lead['full_name'] || lead['Full Name'] || lead['Full_Name'] || lead['nome'] || lead['Nome'] || `Lead ${index + 1}`
                  const adName = lead['ad_name'] || lead['Ad Name'] || lead['Ad_Name'] || ''
                  const adsetName = lead['adset_name'] || lead['Adset Name'] || lead['Adset_Name'] || lead['publico'] || lead['Público'] || ''
                  const campaignName = lead['campaign_name'] || lead['Campaign Name'] || lead['Campaign_Name'] || lead['campanha'] || lead['Campanha'] || ''
                  
                  // Buscar Instagram - tentar todas as variações possíveis
                  const instagram = lead['@_do_instagram_da_sua_empresa'] || 
                                   lead['@_do_instagram_da_sua_empresa'] || 
                                   lead['instagram_da_empresa'] || 
                                   lead['Instagram da Empresa'] || 
                                   lead['Instagram da empresa'] ||
                                   lead['instagram'] || 
                                   lead['Instagram'] || 
                                   lead['@instagram'] || 
                                   lead['@_instagram'] ||
                                   // Tentar buscar qualquer campo que contenha "instagram"
                                   Object.keys(lead).find(key => key.toLowerCase().includes('instagram')) ? lead[Object.keys(lead).find(key => key.toLowerCase().includes('instagram'))!] : '' || ''
                  
                  // Buscar telefone com várias variações
                  const phoneNumber = lead['phone_number'] || 
                                     lead['Phone Number'] || 
                                     lead['Phone_Number'] || 
                                     lead['phone'] || 
                                     lead['Phone'] || 
                                     lead['telefone'] || 
                                     lead['Telefone'] || 
                                     lead['celular'] || 
                                     lead['Celular'] || 
                                     lead['whatsapp'] || 
                                     lead['WhatsApp'] || ''
                  
                  // Buscar faturamento com várias variações
                  const faturamentoMensal = lead['quanto_você_vende_em_média_mensalmente'] || 
                                            lead['Quanto você vende em média mensalmente'] || 
                                            lead['quanto voce vende em media mensalmente'] ||
                                            lead['Quanto voce vende em media mensalmente'] ||
                                            lead['faturamento_mensal'] || 
                                            lead['Faturamento Mensal'] || 
                                            lead['faturamento'] || 
                                            lead['Faturamento'] || 
                                            lead['faturamento_médio'] || 
                                            lead['Faturamento Médio'] ||
                                            // Tentar buscar qualquer campo que contenha "faturamento" ou "vende"
                                            Object.keys(lead).find(key => {
                                              const lowerKey = key.toLowerCase()
                                              return lowerKey.includes('faturamento') || lowerKey.includes('vende') || lowerKey.includes('mensal')
                                            }) ? lead[Object.keys(lead).find(key => {
                                              const lowerKey = key.toLowerCase()
                                              return lowerKey.includes('faturamento') || lowerKey.includes('vende') || lowerKey.includes('mensal')
                                            })!] : '' || ''
                  const qualificado = lead['qualificado'] || lead['Qualificado'] || lead['validação'] || lead['Validação'] || ''
                  const status = lead['lead_status'] || lead['Status'] || lead['status'] || lead['situação'] || lead['situacao'] || 'Novo'

                  return (
                    <div
                      key={index}
                      className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-4 border border-[rgba(199,157,69,0.2)] hover:border-[rgba(199,157,69,0.4)] transition-colors shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-2">
                            {fullName}
                          </h3>
                          <p className="text-sm text-[rgba(255,255,255,0.8)] mb-1">
                            <span className="text-[rgba(255,255,255,0.6)]">INSTA:</span>{' '}
                            {instagram ? (
                              <span className="text-[rgba(255,255,255,0.9)]">{instagram}</span>
                            ) : (
                              <span className="text-[rgba(255,255,255,0.4)] italic">Não informado</span>
                            )}
                          </p>
                          {phoneNumber && (
                            <p className="text-sm text-[rgba(255,255,255,0.8)] mb-1">
                              <span className="text-[rgba(255,255,255,0.6)]">WPP:</span> {formatPhoneNumber(phoneNumber)}
                            </p>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          qualificado?.toString().toUpperCase().includes('QUALIFICADO') || qualificado?.toString().toUpperCase() === 'SIM'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {qualificado?.toString().toUpperCase().includes('QUALIFICADO') || qualificado?.toString().toUpperCase() === 'SIM' ? 'Qualificado' : 'Novo'}
                        </div>
                      </div>

                      <div className="space-y-2 mt-4 pt-4 border-t border-[rgba(199,157,69,0.2)]">
                        {adName && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-[rgba(255,255,255,0.6)] min-w-[100px]">Anúncio:</span>
                            <span className="text-[rgba(255,255,255,0.9)]">{adName}</span>
                          </div>
                        )}
                        {adsetName && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-[rgba(255,255,255,0.6)] min-w-[100px]">Público:</span>
                            <span className="text-[rgba(255,255,255,0.9)]">{adsetName}</span>
                          </div>
                        )}
                        {campaignName && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-[rgba(255,255,255,0.6)] min-w-[100px]">Campanha:</span>
                            <span className="text-[rgba(255,255,255,0.9)]">{campaignName}</span>
                          </div>
                        )}
                        {faturamentoMensal && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-[rgba(255,255,255,0.6)] min-w-[140px]">Faturamento mensal:</span>
                            <span className="text-[rgba(255,255,255,0.9)] font-medium">{faturamentoMensal}</span>
                          </div>
                        )}
                        {!faturamentoMensal && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-[rgba(255,255,255,0.6)] min-w-[140px]">Faturamento mensal:</span>
                            <span className="text-[rgba(255,255,255,0.4)] italic">Não informado</span>
                          </div>
                        )}
                        {status && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-[rgba(255,255,255,0.6)] min-w-[100px]">Status:</span>
                            <span className="text-[rgba(255,255,255,0.9)]">{status}</span>
                          </div>
                        )}
                      </div>

                      <button className="w-full mt-4 bg-[rgba(199,157,69,0.2)] hover:bg-[rgba(199,157,69,0.3)] text-[rgba(255,255,255,0.9)] px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-[rgba(199,157,69,0.3)]">
                        Ver Detalhes
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-8 border border-[rgba(199,157,69,0.2)] shadow-lg text-center">
              <p className="text-[rgba(255,255,255,0.7)]">
                Nenhum lead encontrado na planilha. Verifique se a aba "[DB] Leads" contém dados.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
