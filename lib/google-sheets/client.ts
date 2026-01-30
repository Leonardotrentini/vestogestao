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
    
    const response = await fetch(csvUrl)
    
    if (!response.ok) {
      throw new Error(`Erro ao acessar planilha: ${response.statusText}. Certifique-se de que a planilha está pública ou compartilhada.`)
    }

    const csvText = await response.text()
    
    // Converter CSV para array de arrays
    const lines = csvText.split('\n').filter(line => line.trim())
    const data = lines.map(line => {
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())
      return values
    })

    return data
  } catch (error) {
    console.error('Erro ao ler Google Sheets:', error)
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
