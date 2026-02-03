// Processar dados do Google Sheets e calcular métricas do dashboard

interface Lead {
  [key: string]: any
}

interface Investimento {
  [key: string]: any
}

interface Meta {
  [key: string]: any
}

// Função auxiliar para normalizar nomes de colunas
function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[áàâãä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9_]/g, '')
}

// Função auxiliar para encontrar coluna por nome normalizado
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  const normalizedHeaders = headers.map(normalizeColumnName)
  for (const name of possibleNames) {
    const normalized = normalizeColumnName(name)
    const index = normalizedHeaders.indexOf(normalized)
    if (index !== -1) return index
  }
  return -1
}

export function processDashboardData(
  leadsData: any[][],
  investimentoData: any[][],
  metasData: any[][],
  dateStart?: string,
  dateEnd?: string,
  campaignFilter?: string,
  responsibleFilter?: string,
  gastosTotal?: number // NOVO: valor de gastos da aplicação (prioridade)
) {
  console.log('📊 Processando dados do dashboard...')
  console.log('Leads:', leadsData.length, 'linhas')
  console.log('Investimento:', investimentoData.length, 'linhas')
  console.log('Metas:', metasData.length, 'linhas')

  // Processar cabeçalhos e dados - LER TODAS AS COLUNAS
  if (leadsData.length === 0) {
    console.warn('⚠️ Nenhum dado encontrado na aba de Leads')
    return {
      kpis: {
        cpl: { real: 0, meta: 15 },
        cpql: { real: 0, meta: 45 },
        cpa: { real: 0, meta: 120 },
        cpc: { real: 0, meta: 250 },
        cac: { real: 0, meta: 900 },
      },
      funnel: { leads: 0, qualificados: 0, agendamentos: 0, comparecimentos: 0, vendas: 0 },
      conversion: [],
      responsaveis: [],
      campanhas: [],
      anuncios: [],
      publicos: [],
    }
  }

  const leadsHeaders = leadsData[0] || []
  console.log('📋 Cabeçalhos Leads encontrados:', leadsHeaders)
  console.log('📊 Total de colunas:', leadsHeaders.length)
  
  // Limpar cabeçalhos (remover espaços, caracteres especiais)
  const cleanHeaders = leadsHeaders.map((h: string) => String(h || '').trim())
  console.log('🧹 Cabeçalhos limpos:', cleanHeaders)
  
  // Processar todas as linhas de leads
  const leadsRows = leadsData.slice(1)
    .map((row, rowIndex) => {
      const lead: Lead = {}
      
      // Mapear TODAS as colunas para o objeto lead
      cleanHeaders.forEach((header: string, index: number) => {
        if (header && header.trim()) {
          // Pegar valor da célula, tratando casos de índices fora do range
          const cellValue = row[index] !== undefined ? String(row[index] || '').trim() : ''
          lead[header] = cellValue
        }
      })
      
      return lead
    })
    .filter((lead, rowIndex) => {
      // Filtrar apenas linhas que têm pelo menos algum dado
      const hasData = Object.values(lead).some(val => val && String(val).trim())
      if (!hasData && rowIndex < 5) {
        console.log(`⚠️ Linha ${rowIndex + 2} (após cabeçalho) está vazia:`, lead)
      }
      return hasData
    })

  console.log(`✅ Leads processados: ${leadsRows.length} de ${leadsData.length - 1} linhas totais`)
  
  if (leadsRows.length > 0) {
    console.log('📝 Exemplo de lead processado:', leadsRows[0])
  }

  // Mapear índices das colunas importantes (usar cleanHeaders)
  const leadStatusIndex = findColumnIndex(cleanHeaders, ['lead_status', 'status', 'status_lead', 'situação', 'situacao', 'estado'])
  const qualificadoIndex = findColumnIndex(cleanHeaders, ['validação', 'validacao', 'qualificado', 'qualificacao', 'qualificação', 'is_qualificado', 'validado'])
  const adNameIndex = findColumnIndex(cleanHeaders, ['ad_name', 'campanha', 'nome_campanha', 'anuncio', 'anúncio', 'ad', 'campaign_name'])
  const createdTimeIndex = findColumnIndex(cleanHeaders, ['created_time', 'data', 'data_criacao', 'criado_em', 'timestamp', 'data_cadastro'])
  const responsavelIndex = findColumnIndex(cleanHeaders, ['responsavel', 'responsável', 'atendente', 'vendedor', 'owner', 'responsavel_nome'])
  const etapaIndex = findColumnIndex(cleanHeaders, ['etapa', 'stage', 'fase'])

  console.log('🔍 Índices de colunas importantes:', {
    leadStatusIndex: leadStatusIndex !== -1 ? `${cleanHeaders[leadStatusIndex]} (${leadStatusIndex})` : 'não encontrado',
    qualificadoIndex: qualificadoIndex !== -1 ? `${cleanHeaders[qualificadoIndex]} (${qualificadoIndex})` : 'não encontrado',
    adNameIndex: adNameIndex !== -1 ? `${cleanHeaders[adNameIndex]} (${adNameIndex})` : 'não encontrado',
    createdTimeIndex: createdTimeIndex !== -1 ? `${cleanHeaders[createdTimeIndex]} (${createdTimeIndex})` : 'não encontrado',
    responsavelIndex: responsavelIndex !== -1 ? `${cleanHeaders[responsavelIndex]} (${responsavelIndex})` : 'não encontrado',
    etapaIndex: etapaIndex !== -1 ? `${cleanHeaders[etapaIndex]} (${etapaIndex})` : 'não encontrado',
  })

  // Processar investimento - LER TODAS AS COLUNAS
  let dataIndex = -1
  let campanhaIndex = -1
  let valorIndex = -1
  
  if (investimentoData.length === 0) {
    console.warn('⚠️ Nenhum dado encontrado na aba de Investimento')
  } else {
    const investimentoHeaders = investimentoData[0] || []
    console.log('📋 Cabeçalhos Investimento encontrados:', investimentoHeaders)
    
    // Limpar cabeçalhos
    const cleanInvestimentoHeaders = investimentoHeaders.map((h: string) => String(h || '').trim())
    console.log('🧹 Cabeçalhos Investimento limpos:', cleanInvestimentoHeaders)
    
    dataIndex = findColumnIndex(cleanInvestimentoHeaders, ['data', 'date', 'data_investimento', 'data_gasto'])
    campanhaIndex = findColumnIndex(cleanInvestimentoHeaders, ['campanha', 'ad_name', 'nome_campanha', 'anuncio', 'anúncio', 'campaign_name'])
    valorIndex = findColumnIndex(cleanInvestimentoHeaders, ['valor_investido', 'investimento', 'valor', 'gasto', 'custo', 'spend'])

    console.log('🔍 Índices Investimento:', {
      dataIndex: dataIndex !== -1 ? `${cleanInvestimentoHeaders[dataIndex]} (${dataIndex})` : 'não encontrado',
      campanhaIndex: campanhaIndex !== -1 ? `${cleanInvestimentoHeaders[campanhaIndex]} (${campanhaIndex})` : 'não encontrado',
      valorIndex: valorIndex !== -1 ? `${cleanInvestimentoHeaders[valorIndex]} (${valorIndex})` : 'não encontrado',
    })
  }

  const investimentoRows = investimentoData.length > 0
    ? investimentoData.slice(1)
        .map((row, rowIndex) => {
          const inv: Investimento = {}
          
          // Mapear TODAS as colunas
          const cleanInvestimentoHeaders = investimentoData[0].map((h: string) => String(h || '').trim())
          cleanInvestimentoHeaders.forEach((header: string, index: number) => {
            if (header && header.trim()) {
              const cellValue = row[index] !== undefined ? String(row[index] || '').trim() : ''
              inv[header] = cellValue
            }
          })
          
          // Normalizar valores importantes
          if (dataIndex !== -1 && row[dataIndex] !== undefined) {
            inv.Data = String(row[dataIndex] || '').trim()
          }
          if (campanhaIndex !== -1 && row[campanhaIndex] !== undefined) {
            inv.Campanha = String(row[campanhaIndex] || '').trim()
          }
          if (valorIndex !== -1 && row[valorIndex] !== undefined) {
            const valorStr = String(row[valorIndex] || '0')
            // Remover formatação de moeda e converter
            const cleaned = valorStr.replace(/R\$\s*/gi, '').replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
            inv.Valor_Investido = parseFloat(cleaned) || 0
          }
          
          return inv
        })
        .filter((inv, rowIndex) => {
          // Manter apenas investimentos com valor > 0 ou com dados
          const hasData = (inv.Valor_Investido || 0) > 0 || Object.values(inv).some(val => val && String(val).trim())
          if (!hasData && rowIndex < 3) {
            console.log(`⚠️ Linha ${rowIndex + 2} de investimento está vazia ou inválida:`, inv)
          }
          return hasData
        })
    : []

  console.log(`✅ Investimentos processados: ${investimentoRows.length} de ${investimentoData.length > 0 ? investimentoData.length - 1 : 0} linhas totais`)
  
  if (investimentoRows.length > 0) {
    console.log('📝 Exemplo de investimento processado:', investimentoRows[0])
  }

  // Processar metas
  const metasMap: Record<string, number> = {}
  if (metasData.length > 0) {
    console.log('📋 Processando metas - Total de linhas:', metasData.length)
    console.log('📋 Primeiras 5 linhas de metas:', metasData.slice(0, 5))
    
    metasData.forEach((row, index) => {
      // Ignorar linha de cabeçalho se existir
      if (index === 0 && (row[0]?.toString().toLowerCase().includes('métrica') || row[0]?.toString().toLowerCase().includes('meta'))) {
        console.log('⏭️ Pulando linha de cabeçalho:', row)
        return
      }
      
      if (row[0] && row[1]) {
        const key = String(row[0]).trim()
        // Tentar múltiplos formatos de valor
        let valueStr = String(row[1]).trim()
        
        // Remover formatação de moeda e espaços
        valueStr = valueStr.replace(/R\$\s*/gi, '') // Remove R$
        valueStr = valueStr.replace(/\./g, '') // Remove pontos (separadores de milhar)
        valueStr = valueStr.replace(',', '.') // Converte vírgula para ponto
        valueStr = valueStr.replace(/[^\d.]/g, '') // Remove tudo que não é número ou ponto
        
        const value = parseFloat(valueStr)
        if (!isNaN(value) && value >= 0) {
          metasMap[key] = value
          console.log(`✅ Meta encontrada: "${key}" = ${value} (valor original: "${row[1]}")`)
        } else {
          console.log(`⚠️ Meta com valor inválido: "${key}" = "${row[1]}" (parseado: "${valueStr}", resultado: ${value})`)
        }
      } else {
        if (row[0] || row[1]) {
          console.log(`⚠️ Linha ${index} de metas incompleta:`, row)
        }
      }
    })
  } else {
    console.warn('⚠️ Nenhuma meta encontrada na planilha (metasData está vazio)')
  }

  console.log('📊 Total de metas carregadas:', Object.keys(metasMap).length)
  console.log('📊 Chaves de metas encontradas:', Object.keys(metasMap))
  console.log('🔍 Procurando Gastos_Total nas metas:', {
    'Gastos_Total': metasMap['Gastos_Total'],
    'gastos_total': metasMap['gastos_total'],
    'Gastos Total': metasMap['Gastos Total'],
    'GASTOS_TOTAL': metasMap['GASTOS_TOTAL'],
    'Gastos': metasMap['Gastos'],
    'gastos': metasMap['gastos'],
  })

  // Filtrar leads por data
  let filteredLeads = leadsRows
  if (dateStart || dateEnd) {
    const before = filteredLeads.length
    filteredLeads = leadsRows.filter((lead) => {
      // Buscar data na coluna created_time
      let dateValue = ''
      if (createdTimeIndex !== -1) {
        dateValue = String(lead[cleanHeaders[createdTimeIndex]] || '')
      }
      
      if (!dateValue) return true // Se não tem data, incluir
      
      // Tentar vários formatos de data
      let leadDate: Date | null = null
      try {
        leadDate = new Date(dateValue)
        if (isNaN(leadDate.getTime())) {
          // Tentar formato brasileiro DD/MM/YYYY
          const parts = dateValue.split('/')
          if (parts.length === 3) {
            leadDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
          }
        }
      } catch {
        return true // Se não conseguir parsear, incluir
      }
      
      if (!leadDate || isNaN(leadDate.getTime())) return true
      
      if (dateStart && leadDate < new Date(dateStart)) return false
      if (dateEnd) {
        const endDate = new Date(dateEnd)
        endDate.setHours(23, 59, 59, 999)
        if (leadDate > endDate) return false
      }
      return true
    })
    console.log(`📅 Filtro de data: ${before} → ${filteredLeads.length} leads`)
  }

  // Filtrar por campanha
  if (campaignFilter && campaignFilter !== 'Todas Campanhas') {
    const before = filteredLeads.length
    filteredLeads = filteredLeads.filter((lead) => {
      const campanha = adNameIndex !== -1 
        ? String(lead[cleanHeaders[adNameIndex]] || '')
        : ''
      return campanha.toLowerCase().includes(campaignFilter.toLowerCase())
    })
    console.log(`🎯 Filtro de campanha: ${before} → ${filteredLeads.length} leads`)
  }

  // Filtrar por responsável
  if (responsibleFilter && responsibleFilter !== 'Todos Responsáveis') {
    const before = filteredLeads.length
    filteredLeads = filteredLeads.filter((lead) => {
      const resp = responsavelIndex !== -1
        ? String(lead[cleanHeaders[responsavelIndex]] || '')
        : ''
      return resp.toLowerCase() === responsibleFilter.toLowerCase()
    })
    console.log(`👤 Filtro de responsável: ${before} → ${filteredLeads.length} leads`)
  }

  // Calcular volumes do funil usando detecção inteligente
  const leads = filteredLeads.length
  
  // Qualificados: verificar coluna "validação" com valor "QUALIFICADO"
  const qualificados = filteredLeads.filter((l) => {
    if (qualificadoIndex !== -1) {
      const qual = String(l[cleanHeaders[qualificadoIndex]] || '').toUpperCase().trim()
      return qual === 'QUALIFICADO' || 
             qual === 'QUALIFICADA' ||
             qual === 'SIM' || 
             qual === 'YES' || 
             qual === 'TRUE' || 
             qual === '1' || 
             qual === 'S' ||
             qual.includes('QUALIFIC')
    }
    return false
  }).length
  
  // Agendamentos: verificar lead_status ou etapa
  const agendamentos = filteredLeads.filter((l) => {
    let status = ''
    if (leadStatusIndex !== -1) {
      status = String(l[cleanHeaders[leadStatusIndex]] || '').toLowerCase().trim()
    }
    
    if (etapaIndex !== -1 && !status.includes('agend')) {
      const etapa = String(l[cleanHeaders[etapaIndex]] || '').toLowerCase().trim()
      status += ' ' + etapa
    }
    
    return status.includes('agendamento') || 
           status.includes('agendado') ||
           status.includes('agendada') ||
           status.includes('agend')
  }).length
  
  // Comparecimentos
  const comparecimentos = filteredLeads.filter((l) => {
    let status = ''
    if (leadStatusIndex !== -1) {
      status = String(l[cleanHeaders[leadStatusIndex]] || '').toLowerCase().trim()
    }
    
    if (etapaIndex !== -1) {
      const etapa = String(l[cleanHeaders[etapaIndex]] || '').toLowerCase().trim()
      status += ' ' + etapa
    }
    
    return status.includes('comparecimento') || 
           status.includes('compareceu') ||
           status.includes('presente')
  }).length
  
  // Vendas
  const vendas = filteredLeads.filter((l) => {
    let status = ''
    if (leadStatusIndex !== -1) {
      status = String(l[cleanHeaders[leadStatusIndex]] || '').toLowerCase().trim()
    }
    
    if (etapaIndex !== -1) {
      const etapa = String(l[cleanHeaders[etapaIndex]] || '').toLowerCase().trim()
      status += ' ' + etapa
    }
    
    return status.includes('venda') || 
           status.includes('fechado') ||
           status.includes('fechada') ||
           status.includes('vendido') ||
           status.includes('closed')
  }).length

  console.log('📊 Volumes do funil:', {
    leads,
    qualificados,
    agendamentos,
    comparecimentos,
    vendas
  })
  
  // AVISO: Se não houver leads, os KPIs ficarão R$ 0,00
  if (leads === 0) {
    console.warn('⚠️ ATENÇÃO: Não há leads no período selecionado. Os KPIs ficarão R$ 0,00 mesmo com Gastos_Total configurado.')
    console.warn('💡 Dica: Verifique os filtros de data ou se há leads na planilha [DB] Leads')
  }

  // Calcular investimento total
  // PRIORIDADE 1: Se tiver gastosTotal passado como parâmetro (da aplicação), usar esse valor
  // PRIORIDADE 2: Se tiver Gastos_Total nas metas da planilha, usar esse valor
  // PRIORIDADE 3: Somar os investimentos da aba [INPUT] Investimento
  let totalInvestimento = 0
  
  if (gastosTotal !== undefined && gastosTotal !== null && gastosTotal > 0) {
    // PRIORIDADE 1: Usar valor da aplicação
    totalInvestimento = gastosTotal
    console.log('✅ Investimento total (usando Gastos_Total da aplicação):', totalInvestimento)
  } else {
    // Tentar várias variações do nome na planilha
    const gastosTotalPlanilha = metasMap['Gastos_Total'] || 
                                metasMap['gastos_total'] || 
                                metasMap['Gastos Total'] || 
                                metasMap['GASTOS_TOTAL'] ||
                                metasMap['Gastos'] ||
                                metasMap['gastos'] ||
                                metasMap['GASTOS'] ||
                                metasMap['Total_Gastos'] ||
                                metasMap['total_gastos'] ||
                                metasMap['Total Gastos']
    
    console.log('🔍 Valor de Gastos_Total encontrado na planilha:', gastosTotalPlanilha)
    
    if (gastosTotalPlanilha !== undefined && gastosTotalPlanilha !== null && gastosTotalPlanilha > 0) {
      // PRIORIDADE 2: Usar valor da planilha
      totalInvestimento = gastosTotalPlanilha
      console.log('✅ Investimento total (usando Gastos_Total da planilha):', totalInvestimento)
    } else {
      // PRIORIDADE 3: Somar investimentos da aba [INPUT] Investimento
      if (campaignFilter && campaignFilter !== 'Todas Campanhas') {
        totalInvestimento = investimentoRows
          .filter((inv) => {
            const campanha = String(inv.Campanha || '').toLowerCase()
            return campanha.includes(campaignFilter.toLowerCase())
          })
          .reduce((sum, inv) => sum + (inv.Valor_Investido || 0), 0)
      } else {
        totalInvestimento = investimentoRows.reduce((sum, inv) => sum + (inv.Valor_Investido || 0), 0)
      }
      console.log('⚠️ Investimento total (soma da aba [INPUT] Investimento - Gastos_Total não encontrado):', totalInvestimento)
    }
  }

  // Calcular KPIs
  const cpl = leads > 0 ? totalInvestimento / leads : 0
  const cpql = qualificados > 0 ? totalInvestimento / qualificados : 0
  const cpa = agendamentos > 0 ? totalInvestimento / agendamentos : 0
  const cpc = comparecimentos > 0 ? totalInvestimento / comparecimentos : 0
  const cac = vendas > 0 ? totalInvestimento / vendas : 0

  console.log('📊 Cálculo dos KPIs:', {
    gastosTotalParametro: gastosTotal,
    totalInvestimento,
    leads,
    qualificados,
    agendamentos,
    comparecimentos,
    vendas,
    cpl,
    cpql,
    cpa,
    cpc,
    cac
  })
  
  // AVISO se não houver leads mas tiver gastos
  if (totalInvestimento > 0 && leads === 0) {
    console.warn('⚠️ ATENÇÃO: Há investimento (R$ ' + totalInvestimento + ') mas não há leads. Os KPIs ficarão R$ 0,00.')
    console.warn('💡 Verifique os filtros de data ou se há leads na planilha [DB] Leads')
  }

  // Buscar metas (com múltiplas variações de nome)
  const metaCPL = metasMap['Meta_CPL'] || metasMap['CPL'] || metasMap['meta_cpl'] || metasMap['Meta CPL'] || 15
  const metaCPQL = metasMap['Meta_CPQL'] || metasMap['CPQL'] || metasMap['Meta_CPL_Qualificado'] || metasMap['meta_cpql'] || metasMap['Meta CPQL'] || 45
  const metaCPA = metasMap['Meta_CPA'] || metasMap['CPA'] || metasMap['Meta_Agendamento'] || metasMap['meta_cpa'] || metasMap['Meta CPA'] || 120
  const metaCPC = metasMap['Meta_CPC'] || metasMap['CPC'] || metasMap['Meta_Comparecimento'] || metasMap['meta_cpc'] || metasMap['Meta CPC'] || 250
  const metaCAC = metasMap['Meta_CAC'] || metasMap['CAC'] || metasMap['Meta_Venda'] || metasMap['meta_cac'] || metasMap['Meta CAC'] || 900

  console.log('🎯 Metas aplicadas:', {
    metaCPL,
    metaCPQL,
    metaCPA,
    metaCPC,
    metaCAC
  })

  // Calcular taxas de conversão
  const taxaQualificacao = leads > 0 ? (qualificados / leads) * 100 : 0
  const taxaAgendamento = qualificados > 0 ? (agendamentos / qualificados) * 100 : 0
  const taxaComparecimento = agendamentos > 0 ? (comparecimentos / agendamentos) * 100 : 0
  const taxaFechamento = comparecimentos > 0 ? (vendas / comparecimentos) * 100 : 0

  // Metas de conversão
  const metaTaxaQualificacao = metasMap['Meta_Taxa_Qualificacao'] || metasMap['Taxa_Qualificacao'] || metasMap['meta_taxa_qualificacao'] || 30
  const metaTaxaAgendamento = metasMap['Meta_Taxa_Agendamento'] || metasMap['Taxa_Agendamento'] || metasMap['meta_taxa_agendamento'] || 40
  const metaTaxaComparecimento = metasMap['Meta_Taxa_Comparecimento'] || metasMap['Taxa_Comparecimento'] || metasMap['meta_taxa_comparecimento'] || 60
  const metaTaxaFechamento = metasMap['Meta_Taxa_Fechamento'] || metasMap['Taxa_Fechamento'] || metasMap['meta_taxa_fechamento'] || 25

  // Agrupar por responsável
  const responsaveisMap = new Map<string, { leads: number; vendas: number }>()
  filteredLeads.forEach((lead) => {
    const resp = responsavelIndex !== -1
      ? String(lead[cleanHeaders[responsavelIndex]] || 'Sem responsável')
      : 'Sem responsável'
    if (!responsaveisMap.has(resp)) {
      responsaveisMap.set(resp, { leads: 0, vendas: 0 })
    }
    const data = responsaveisMap.get(resp)!
    data.leads++
    
    let status = ''
    if (leadStatusIndex !== -1) {
      status = String(lead[cleanHeaders[leadStatusIndex]] || '').toLowerCase()
    }
    if (etapaIndex !== -1) {
      const etapa = String(lead[cleanHeaders[etapaIndex]] || '').toLowerCase()
      status += ' ' + etapa
    }
    
    if (status.includes('venda') || status.includes('fechado') || status.includes('fechada')) {
      data.vendas++
    }
  })

  const responsaveis = Array.from(responsaveisMap.entries()).map(([nome, data]) => ({
    nome,
    leads: data.leads,
    vendas: data.vendas,
    convFinal: data.leads > 0 ? (data.vendas / data.leads) * 100 : 0,
  }))

  // Agrupar por campanha
  const campanhasMap = new Map<string, { investimento: number; leads: number }>()
  
  investimentoRows.forEach((inv) => {
    const campanha = inv.Campanha || 'Sem campanha'
    if (!campanhasMap.has(campanha)) {
      campanhasMap.set(campanha, { investimento: 0, leads: 0 })
    }
    const data = campanhasMap.get(campanha)!
    data.investimento += inv.Valor_Investido || 0
  })

  filteredLeads.forEach((lead) => {
    const campanha = adNameIndex !== -1
      ? String(lead[cleanHeaders[adNameIndex]] || 'Sem campanha')
      : 'Sem campanha'
    if (!campanhasMap.has(campanha)) {
      campanhasMap.set(campanha, { investimento: 0, leads: 0 })
    }
    const data = campanhasMap.get(campanha)!
    data.leads++
  })

  const campanhas = Array.from(campanhasMap.entries()).map(([campanha, data]) => ({
    campanha,
    investimento: data.investimento,
    leads: data.leads,
    cpl: data.leads > 0 ? data.investimento / data.leads : 0,
  }))

  // Agrupar por ANÚNCIO (ad_name) - apenas leads qualificados
  const adsetNameIndex = findColumnIndex(cleanHeaders, ['adset_name', 'adset', 'publico', 'público', 'audience'])
  const anunciosMap = new Map<string, { investimento: number; leadsQualificados: number }>()
  
  // Primeiro, contar leads qualificados por anúncio
  filteredLeads.forEach((lead) => {
    const isQualificado = qualificadoIndex !== -1
      ? String(lead[cleanHeaders[qualificadoIndex]] || '').toUpperCase().trim() === 'QUALIFICADO'
      : false
    
    if (isQualificado && adNameIndex !== -1) {
      const anuncio = String(lead[cleanHeaders[adNameIndex]] || 'Sem anúncio')
      if (!anunciosMap.has(anuncio)) {
        anunciosMap.set(anuncio, { investimento: 0, leadsQualificados: 0 })
      }
      const data = anunciosMap.get(anuncio)!
      data.leadsQualificados++
    }
  })
  
  // Depois, buscar investimento por anúncio (usando ad_name como chave)
  investimentoRows.forEach((inv) => {
    const campanhaInv = String(inv.Campanha || '').toLowerCase()
    
    // Tentar encontrar anúncio correspondente
    anunciosMap.forEach((data, anuncio) => {
      const anuncioLower = anuncio.toLowerCase()
      if (campanhaInv.includes(anuncioLower) || anuncioLower.includes(campanhaInv) || campanhaInv === anuncioLower) {
        data.investimento += inv.Valor_Investido || 0
      }
    })
  })
  
  // Se ainda não tem investimento, tentar buscar por ad_name nos leads
  anunciosMap.forEach((data, anuncio) => {
    if (data.investimento === 0) {
      const lead = filteredLeads.find(l => {
        if (adNameIndex !== -1) {
          return String(l[cleanHeaders[adNameIndex]] || '').toLowerCase() === anuncio.toLowerCase()
        }
        return false
      })
      
      if (lead && adNameIndex !== -1) {
        // Tentar buscar investimento pela campanha do lead
        const leadCampanha = String(lead[cleanHeaders[adNameIndex]] || '')
        const inv = investimentoRows.find(inv => {
          const campanha = String(inv.Campanha || '').toLowerCase()
          return campanha.includes(leadCampanha.toLowerCase()) || 
                 leadCampanha.toLowerCase().includes(campanha)
        })
        if (inv) {
          data.investimento = inv.Valor_Investido || 0
        }
      }
    }
  })

  const anuncios = Array.from(anunciosMap.entries())
    .map(([anuncio, data]) => ({
      anuncio,
      investimento: data.investimento,
      leadsQualificados: data.leadsQualificados,
      cpql: data.leadsQualificados > 0 ? data.investimento / data.leadsQualificados : 0,
    }))
    .filter(a => a.leadsQualificados > 0) // Apenas anúncios com qualificados
    .sort((a, b) => b.leadsQualificados - a.leadsQualificados) // Ordenar por mais qualificados
    .slice(0, 5) // Top 5

  // Agrupar por PÚBLICO (adset_name) - apenas leads qualificados
  const publicosMap = new Map<string, { investimento: number; leadsQualificados: number }>()
  
  if (adsetNameIndex !== -1) {
    // Primeiro, contar leads qualificados por público
    filteredLeads.forEach((lead) => {
      const isQualificado = qualificadoIndex !== -1
        ? String(lead[cleanHeaders[qualificadoIndex]] || '').toUpperCase().trim() === 'QUALIFICADO'
        : false
      
      if (isQualificado) {
        const publico = String(lead[cleanHeaders[adsetNameIndex]] || 'Sem público')
        if (!publicosMap.has(publico)) {
          publicosMap.set(publico, { investimento: 0, leadsQualificados: 0 })
        }
        const data = publicosMap.get(publico)!
        data.leadsQualificados++
      }
    })
    
    // Depois, buscar investimento por público
    investimentoRows.forEach((inv) => {
      const campanhaInv = String(inv.Campanha || '').toLowerCase()
      
      publicosMap.forEach((data, publico) => {
        const publicoLower = publico.toLowerCase()
        if (campanhaInv.includes(publicoLower) || publicoLower.includes(campanhaInv)) {
          data.investimento += inv.Valor_Investido || 0
        }
      })
    })
    
    // Se ainda não tem investimento, tentar buscar pelo adset_name do lead
    publicosMap.forEach((data, publico) => {
      if (data.investimento === 0) {
        const lead = filteredLeads.find(l => {
          if (adsetNameIndex !== -1) {
            return String(l[cleanHeaders[adsetNameIndex]] || '').toLowerCase() === publico.toLowerCase()
          }
          return false
        })
        
        if (lead) {
          // Tentar buscar investimento pela campanha do lead
          const leadCampanha = adNameIndex !== -1 
            ? String(lead[cleanHeaders[adNameIndex]] || '')
            : ''
          const inv = investimentoRows.find(inv => {
            const campanha = String(inv.Campanha || '').toLowerCase()
            return campanha.includes(leadCampanha.toLowerCase()) || 
                   leadCampanha.toLowerCase().includes(campanha) ||
                   campanha.includes(publico.toLowerCase())
          })
          if (inv) {
            data.investimento = inv.Valor_Investido || 0
          }
        }
      }
    })
  }

  const publicos = Array.from(publicosMap.entries())
    .map(([publico, data]) => ({
      publico,
      investimento: data.investimento,
      leadsQualificados: data.leadsQualificados,
      cpql: data.leadsQualificados > 0 ? data.investimento / data.leadsQualificados : 0,
    }))
    .filter(p => p.leadsQualificados > 0) // Apenas públicos com qualificados
    .sort((a, b) => b.leadsQualificados - a.leadsQualificados) // Ordenar por mais qualificados
    .slice(0, 5) // Top 5

  console.log('✅ Processamento concluído!')
  console.log('🏆 Anúncios campeões:', anuncios.length)
  console.log('👥 Públicos campeões:', publicos.length)

  return {
    kpis: {
      cpl: { real: cpl, meta: metaCPL },
      cpql: { real: cpql, meta: metaCPQL },
      cpa: { real: cpa, meta: metaCPA },
      cpc: { real: cpc, meta: metaCPC },
      cac: { real: cac, meta: metaCAC },
    },
    funnel: {
      leads,
      qualificados,
      agendamentos,
      comparecimentos,
      vendas,
    },
    conversion: [
      {
        etapa: 'Qualificação',
        taxaReal: taxaQualificacao,
        meta: metaTaxaQualificacao,
        status: taxaQualificacao >= metaTaxaQualificacao ? 'dentro' : 'abaixo',
      },
      {
        etapa: 'Agendamento',
        taxaReal: taxaAgendamento,
        meta: metaTaxaAgendamento,
        status: taxaAgendamento >= metaTaxaAgendamento ? 'dentro' : 'abaixo',
      },
      {
        etapa: 'Comparecimento',
        taxaReal: taxaComparecimento,
        meta: metaTaxaComparecimento,
        status: taxaComparecimento >= metaTaxaComparecimento ? 'dentro' : 'abaixo',
      },
      {
        etapa: 'Fechamento',
        taxaReal: taxaFechamento,
        meta: metaTaxaFechamento,
        status: taxaFechamento >= metaTaxaFechamento ? 'dentro' : 'abaixo',
      },
    ],
    responsaveis,
    campanhas,
    anuncios,
    publicos,
    leads: filteredLeads, // Adicionar leads processados para o CRM
    leadsHeaders: cleanHeaders, // Adicionar cabeçalhos para referência
  }
}
