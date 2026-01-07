/**
 * Análise simples de Excel SEM IA
 * Analisa a estrutura do arquivo e sugere configurações baseado em padrões
 */

export interface SimpleBriefing {
  summary: string
  dataType: string
  grouping: {
    strategy: 'by_column' | 'single_group'
    byColumn?: string
    defaultGroup?: string
  }
  suggestedColumns: Array<{
    name: string
    type: 'text' | 'status' | 'number' | 'currency' | 'date' | 'person' | 'priority' | 'link'
    description: string
  }>
  visualizations: Array<{
    type: 'pie' | 'bar' | 'line' | 'table' | 'metric'
    title: string
    description: string
    dataSource: string
  }>
  recommendations: string[]
}

interface ExcelStructure {
  headers: string[]
  rowCount: number
  sampleRows: any[][]
  fileInfo: {
    name: string
    sheetName: string
  }
}

/**
 * Detecta tipo de coluna baseado no nome e dados
 */
function detectColumnType(header: string, sampleValues: any[]): 'text' | 'status' | 'number' | 'currency' | 'date' | 'person' | 'priority' | 'link' {
  const headerLower = header.toLowerCase()
  
  // Status
  if (headerLower.includes('status') || headerLower.includes('estado') || headerLower.includes('situação')) {
    return 'status'
  }
  
  // Prioridade
  if (headerLower.includes('prioridade') || headerLower.includes('urgência') || headerLower.includes('priority')) {
    return 'priority'
  }
  
  // Pessoa
  if (headerLower.includes('responsável') || headerLower.includes('pessoa') || headerLower.includes('usuario') || 
      headerLower.includes('vendedor') || headerLower.includes('cliente') || headerLower.includes('nome')) {
    return 'person'
  }
  
  // Data
  if (headerLower.includes('data') || headerLower.includes('date') || headerLower.includes('criado') || 
      headerLower.includes('atualizado') || headerLower.includes('início') || headerLower.includes('fim')) {
    return 'date'
  }
  
  // Link
  if (headerLower.includes('link') || headerLower.includes('url') || headerLower.includes('site') || 
      headerLower.includes('web') || headerLower.startsWith('http')) {
    return 'link'
  }
  
  // Moeda
  if (headerLower.includes('valor') || headerLower.includes('preço') || headerLower.includes('custo') || 
      headerLower.includes('total') || headerLower.includes('receita') || headerLower.includes('orçamento') ||
      headerLower.includes('$') || headerLower.includes('r$') || headerLower.includes('usd') ||
      headerLower.includes('price') || headerLower.includes('amount') || headerLower.includes('budget')) {
    // Verificar se os valores são numéricos
    const numericCount = sampleValues.filter(v => {
      if (!v) return false
      const str = String(v).replace(/[^\d.,]/g, '').replace(',', '.')
      return !isNaN(parseFloat(str)) && parseFloat(str) > 0
    }).length
    if (numericCount > 0) return 'currency'
  }
  
  // Número
  const numericCount = sampleValues.filter(v => {
    if (!v) return false
    const num = parseFloat(String(v).replace(/[^\d.,]/g, '').replace(',', '.'))
    return !isNaN(num)
  }).length
  
  if (numericCount > sampleValues.length * 0.7) {
    return 'number'
  }
  
  // Texto (padrão)
  return 'text'
}

/**
 * Analisa estrutura e sugere agrupamento
 */
function suggestGrouping(headers: string[]): { strategy: 'by_column' | 'single_group', byColumn?: string, defaultGroup?: string } {
  // Procurar colunas comuns para agrupamento
  const groupKeywords = ['categoria', 'tipo', 'grupo', 'cliente', 'projeto', 'status', 'mês', 'mês/ano', 'categoria', 'departamento']
  
  for (const header of headers) {
    const headerLower = header.toLowerCase()
    if (groupKeywords.some(keyword => headerLower.includes(keyword))) {
      return {
        strategy: 'by_column',
        byColumn: header
      }
    }
  }
  
  return {
    strategy: 'single_group',
    defaultGroup: 'Itens'
  }
}

/**
 * Gera visualizações sugeridas baseado nas colunas
 */
function suggestVisualizations(headers: string[], columnTypes: Map<string, string>): Array<{
  type: 'pie' | 'bar' | 'line' | 'table' | 'metric'
  title: string
  description: string
  dataSource: string
}> {
  const visualizations: Array<{
    type: 'pie' | 'bar' | 'line' | 'table' | 'metric'
    title: string
    description: string
    dataSource: string
  }> = []
  
  // Procurar colunas de status para gráfico de pizza
  for (const header of headers) {
    if (columnTypes.get(header) === 'status') {
      visualizations.push({
        type: 'pie',
        title: `Distribuição por ${header}`,
        description: `Mostra a quantidade de itens por ${header.toLowerCase()}`,
        dataSource: header
      })
      break
    }
  }
  
  // Procurar colunas numéricas/currency para gráfico de barras
  for (const header of headers) {
    if (columnTypes.get(header) === 'currency' || columnTypes.get(header) === 'number') {
      visualizations.push({
        type: 'bar',
        title: `Comparação de ${header}`,
        description: `Compara valores de ${header.toLowerCase()}`,
        dataSource: header
      })
      break
    }
  }
  
  // Se tem data, sugerir gráfico de linha
  for (const header of headers) {
    if (columnTypes.get(header) === 'date') {
      visualizations.push({
        type: 'line',
        title: `Evolução ao longo do tempo`,
        description: `Mostra tendências baseado em ${header.toLowerCase()}`,
        dataSource: header
      })
      break
    }
  }
  
  // Métrica total
  for (const header of headers) {
    if (columnTypes.get(header) === 'currency') {
      visualizations.push({
        type: 'metric',
        title: `Total ${header}`,
        description: `Soma total de ${header.toLowerCase()}`,
        dataSource: header
      })
      break
    }
  }
  
  return visualizations
}

/**
 * Analisa Excel sem usar IA
 */
export function analyzeExcelSimple(excelStructure: ExcelStructure, userDescription?: string): SimpleBriefing {
  const { headers, rowCount, sampleRows, fileInfo } = excelStructure
  
  // Detectar tipos de colunas
  const columnTypes = new Map<string, string>()
  const suggestedColumns = headers.map(header => {
    // Pegar valores da amostra para esta coluna
    const colIndex = headers.indexOf(header)
    const sampleValues = sampleRows.map(row => row[colIndex]).filter(v => v !== null && v !== undefined && v !== '')
    
    const type = detectColumnType(header, sampleValues)
    columnTypes.set(header, type)
    
    const descriptions: Record<string, string> = {
      'status': 'Status do item',
      'priority': 'Nível de prioridade',
      'person': 'Pessoa responsável',
      'date': 'Data',
      'link': 'Link/URL',
      'currency': 'Valor monetário',
      'number': 'Número',
      'text': 'Texto'
    }
    
    return {
      name: header,
      type,
      description: descriptions[type] || 'Campo de texto'
    }
  })
  
  // Sugerir agrupamento
  const grouping = suggestGrouping(headers)
  
  // Gerar visualizações
  const visualizations = suggestVisualizations(headers, columnTypes)
  
  // Gerar resumo
  const summary = userDescription 
    ? `${userDescription}\n\nArquivo "${fileInfo.name}" com ${rowCount} linhas e ${headers.length} colunas.`
    : `Arquivo "${fileInfo.name}" contendo ${rowCount} registros com ${headers.length} colunas: ${headers.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''}.`
  
  // Detectar tipo de dados
  let dataType = 'dados gerais'
  const fileName = fileInfo.name.toLowerCase()
  if (fileName.includes('campanha') || fileName.includes('marketing')) {
    dataType = 'campanhas de marketing'
  } else if (fileName.includes('venda') || fileName.includes('vendas')) {
    dataType = 'vendas'
  } else if (fileName.includes('cliente') || fileName.includes('clientes')) {
    dataType = 'clientes'
  } else if (fileName.includes('projeto') || fileName.includes('projetos')) {
    dataType = 'projetos'
  } else if (fileName.includes('tarefa') || fileName.includes('tarefas')) {
    dataType = 'tarefas'
  }
  
  // Recomendações
  const recommendations: string[] = []
  if (columnTypes.has('status')) {
    recommendations.push('Use filtros por status para organizar melhor os itens')
  }
  if (columnTypes.has('date')) {
    recommendations.push('Visualize a evolução temporal dos dados')
  }
  if (columnTypes.has('currency')) {
    recommendations.push('Monitore os valores totais e médios')
  }
  if (rowCount > 100) {
    recommendations.push('Considere usar busca e filtros devido ao volume de dados')
  }
  
  return {
    summary,
    dataType,
    grouping,
    suggestedColumns,
    visualizations,
    recommendations
  }
}

