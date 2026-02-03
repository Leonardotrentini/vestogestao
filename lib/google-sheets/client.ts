// Extrair ID da planilha da URL
export function extractSpreadsheetId(url: string): string | null {
  // Padrões de URL do Google Sheets:
  // https://docs.google.com/spreadsheets/d/ID/edit
  // https://docs.google.com/spreadsheets/d/ID/edit#gid=0
  // https://docs.google.com/spreadsheets/d/ID
  
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /^([a-zA-Z0-9-_]+)$/, // Se já for só o ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

// Função melhorada para fazer parsing de CSV
function parseCSV(csvText: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false
  let i = 0

  while (i < csvText.length) {
    const char = csvText[i]
    const nextChar = csvText[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Aspas duplas dentro de campo com aspas = aspas literal
        currentField += '"'
        i += 2
        continue
      } else {
        // Toggle aspas
        inQuotes = !inQuotes
        i++
        continue
      }
    }

    if (char === ',' && !inQuotes) {
      // Fim do campo
      currentRow.push(currentField.trim())
      currentField = ''
      i++
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      // Fim da linha
      if (char === '\r' && nextChar === '\n') {
        // Windows line ending
        i += 2
      } else {
        i++
      }
      
      // Adicionar último campo da linha
      currentRow.push(currentField.trim())
      currentField = ''
      
      // Adicionar linha se tiver dados
      if (currentRow.length > 0 && currentRow.some(cell => cell.trim() !== '')) {
        rows.push(currentRow)
      }
      currentRow = []
      continue
    }

    // Caractere normal
    currentField += char
    i++
  }

  // Adicionar última linha se tiver dados
  if (currentField.trim() !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some(cell => cell.trim() !== '')) {
      rows.push(currentRow)
    }
  }

  return rows
}

// Função para ler uma aba específica do Google Sheets usando API pública
export async function readSheetRange(
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  try {
    // Usar a API pública do Google Sheets (planilha precisa estar pública ou compartilhada)
    // Formato: https://docs.google.com/spreadsheets/d/{spreadsheetId}/gviz/tq?tqx=out:csv&sheet={sheetName}
    
    // Converter range para formato de URL
    const sheetName = range.split('!')[0].replace(/[\[\]]/g, '')
    const columnRange = range.split('!')[1] || 'A:Z'
    
    // Usar API pública via CSV (mais simples, não precisa de autenticação)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&range=${columnRange}`
    
    console.log(`📥 Lendo aba "${sheetName}" da planilha ${spreadsheetId}`)
    console.log(`🔗 URL: ${csvUrl}`)
    
    const response = await fetch(csvUrl, {
      headers: {
        'Accept': 'text/csv',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error(`❌ Erro HTTP ${response.status}:`, errorText)
      throw new Error(`Erro ao acessar planilha: ${response.statusText} (${response.status}). Certifique-se de que a planilha está pública ou compartilhada com "Qualquer pessoa com o link".`)
    }

    const csvText = await response.text()
    
    if (!csvText || csvText.trim().length === 0) {
      console.warn(`⚠️ Planilha "${sheetName}" retornou vazia`)
      return []
    }

    console.log(`✅ Recebidos ${csvText.length} caracteres da aba "${sheetName}"`)
    
    // Converter CSV para array de arrays usando parser melhorado
    const data = parseCSV(csvText)
    
    console.log(`✅ Parseado ${data.length} linhas da aba "${sheetName}"`)
    if (data.length > 0) {
      console.log(`📋 Primeira linha (cabeçalhos):`, data[0])
      console.log(`📊 Total de colunas: ${data[0]?.length || 0}`)
    }

    return data
  } catch (error: any) {
    console.error(`❌ Erro ao ler aba "${range}":`, error)
    throw error
  }
}

// Função para buscar dados das 3 abas principais
export async function fetchDashboardData(spreadsheetId: string) {
  try {
    let leadsData: any[][] = []
    let investimentoData: any[][] = []
    let metasData: any[][] = []

    // Tentar ler aba [DB] Leads (com colchetes)
    try {
      leadsData = await readSheetRange(spreadsheetId, '[DB] Leads!A:Z')
    } catch {
      // Tentar sem colchetes
      try {
        leadsData = await readSheetRange(spreadsheetId, 'DB Leads!A:Z')
      } catch {
        console.warn('Aba [DB] Leads não encontrada')
      }
    }
    
    // Tentar ler aba [INPUT] Investimento (com colchetes)
    try {
      investimentoData = await readSheetRange(spreadsheetId, '[INPUT] Investimento!A:Z')
    } catch {
      // Tentar sem colchetes
      try {
        investimentoData = await readSheetRange(spreadsheetId, 'INPUT Investimento!A:Z')
      } catch {
        console.warn('Aba [INPUT] Investimento não encontrada')
      }
    }
    
    // Tentar ler aba [CONFIG] Metas (com colchetes)
    try {
      metasData = await readSheetRange(spreadsheetId, '[CONFIG] Metas!A:B')
      console.log('✅ Aba [CONFIG] Metas encontrada (com colchetes)')
    } catch (error) {
      console.log('⚠️ Tentando ler aba sem colchetes...', error)
      // Tentar sem colchetes
      try {
        metasData = await readSheetRange(spreadsheetId, 'CONFIG Metas!A:B')
        console.log('✅ Aba CONFIG Metas encontrada (sem colchetes)')
      } catch (error2) {
        console.warn('❌ Aba [CONFIG] Metas não encontrada', error2)
      }
    }
    
    if (metasData.length > 0) {
      console.log(`✅ Total de linhas lidas da aba [CONFIG] Metas: ${metasData.length}`)
    } else {
      console.warn('⚠️ Nenhum dado encontrado na aba [CONFIG] Metas')
    }

    return {
      leads: leadsData,
      investimento: investimentoData,
      metas: metasData,
    }
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    throw error
  }
}
