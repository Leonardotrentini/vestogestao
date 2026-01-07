import OpenAI from 'openai'

let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.error('OPENAI_API_KEY não encontrada no process.env')
      console.error('Variáveis de ambiente disponíveis:', Object.keys(process.env).filter(k => k.includes('OPENAI')))
      throw new Error('OPENAI_API_KEY não configurada. Adicione no arquivo .env.local e REINICIE o servidor.')
    }

    if (apiKey === 'your_openai_api_key' || apiKey.trim() === '') {
      throw new Error('OPENAI_API_KEY está vazia ou com valor padrão. Configure uma API key válida.')
    }

    openaiClient = new OpenAI({
      apiKey: apiKey,
    })
  }

  return openaiClient
}

/**
 * Analisa um arquivo Excel e descrição do usuário, retornando um briefing estruturado
 */
export async function analyzeImportWithAI(
  excelStructure: {
    headers: string[]
    rowCount: number
    sampleRows: any[][]
    fileInfo: {
      name: string
      sheetName: string
    }
  },
  userDescription: string
): Promise<{
  summary: string
  dataType: string
  grouping: {
    strategy: string
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
}> {
  const client = getOpenAIClient()

  const prompt = `Você é um assistente especializado em análise de dados e criação de dashboards.

ANÁLISE DO ARQUIVO EXCEL:
- Nome do arquivo: ${excelStructure.fileInfo.name}
- Planilha: ${excelStructure.fileInfo.sheetName}
- Total de linhas: ${excelStructure.rowCount}
- Cabeçalhos encontrados: ${excelStructure.headers.join(', ')}
- Exemplo de dados (primeiras 3 linhas):
${excelStructure.sampleRows.slice(0, 3).map((row, idx) => 
  `Linha ${idx + 1}: ${row.map((cell, i) => `${excelStructure.headers[i]}: ${cell}`).join(', ')}`
).join('\n')}

DESCRIÇÃO DO USUÁRIO:
"${userDescription}"

TAREFA:
Analise o arquivo e a descrição, e retorne um briefing estruturado em JSON com:

1. **summary**: Resumo claro do que são esses dados (1-2 parágrafos)
2. **dataType**: Tipo principal dos dados (ex: "campanhas de marketing", "vendas", "clientes", "projetos")
3. **grouping**: Estratégia de agrupamento:
   - strategy: "by_column" (se agrupar por coluna) ou "single_group" (um grupo único)
   - byColumn: nome da coluna para agrupar (se strategy = "by_column")
   - defaultGroup: nome do grupo padrão (se strategy = "single_group")
4. **suggestedColumns**: Array de colunas sugeridas baseado nos cabeçalhos:
   - name: nome da coluna
   - type: tipo sugerido (text, status, number, currency, date, person, priority, link)
   - description: descrição do que é essa coluna
5. **visualizations**: Array de visualizações recomendadas:
   - type: tipo (pie, bar, line, table, metric)
   - title: título da visualização
   - description: o que mostra
   - dataSource: qual coluna/dado usar
6. **recommendations**: Array de recomendações e insights

Retorne APENAS JSON válido, sem markdown, sem explicações adicionais. Formato:
{
  "summary": "...",
  "dataType": "...",
  "grouping": {...},
  "suggestedColumns": [...],
  "visualizations": [...],
  "recommendations": [...]
}`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Usando modelo mais barato
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em análise de dados. Retorne sempre JSON válido e estruturado, sem markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Mais determinístico
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Resposta vazia da IA')
    }

    const briefing = JSON.parse(content)
    return briefing as any

  } catch (error: any) {
    console.error('Erro ao analisar com IA:', error)
    
    // Erro de API key
    if (error.message?.includes('OPENAI_API_KEY') || error.status === 401) {
      throw new Error('OPENAI_API_KEY inválida ou não configurada. Verifique sua API key no arquivo .env.local e reinicie o servidor.')
    }
    
    // Erro de rate limit
    if (error.status === 429) {
      throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.')
    }
    
    // Erro de conexão
    if (error.message?.includes('fetch') || error.code === 'ECONNREFUSED') {
      throw new Error('Erro de conexão com a API da OpenAI. Verifique sua conexão com a internet.')
    }
    
    // Erro de parse JSON
    if (error instanceof SyntaxError) {
      throw new Error('Erro ao processar resposta da IA. Tente novamente.')
    }
    
    // Erro genérico
    throw new Error(`Erro ao analisar com IA: ${error.message || 'Erro desconhecido'}`)
  }
}

