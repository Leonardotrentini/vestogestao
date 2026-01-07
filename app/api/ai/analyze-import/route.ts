import { NextRequest, NextResponse } from 'next/server'
import { analyzeImportWithAI } from '@/lib/ai/openai-client'
import { ImportBriefing, ExcelStructure } from '@/types/briefing'

/**
 * POST /api/ai/analyze-import
 * Analisa um arquivo Excel e descrição do usuário usando IA
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      )
    }

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'Descrição é obrigatória' },
        { status: 400 }
      )
    }

    // Verificar se é Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Apenas arquivos Excel (.xlsx, .xls) são suportados' },
        { status: 400 }
      )
    }

    // Parsear Excel
    const XLSX = await import('xlsx')
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    
    // Pegar primeira planilha
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    
    // Converter para array de arrays
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: '' 
    }) as any[][]

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { error: 'Planilha vazia' },
        { status: 400 }
      )
    }

    // Preparar estrutura para análise
    const headers = (jsonData[0] || []).map((h: any) => String(h || '').trim()).filter(h => h)
    const rows = jsonData.slice(1).filter(row => 
      row && row.some((cell: any) => cell && String(cell).trim() !== '')
    )

    if (headers.length === 0) {
      return NextResponse.json(
        { error: 'Planilha não possui cabeçalhos válidos' },
        { status: 400 }
      )
    }

    // Pegar amostra de até 5 linhas para análise
    const sampleRows = rows.slice(0, 5).map(row => 
      headers.map((_, idx) => row[idx] || '')
    )

    const excelStructure: ExcelStructure = {
      headers,
      rowCount: rows.length,
      sampleRows,
      fileInfo: {
        name: file.name,
        sheetName: firstSheetName
      }
    }

    // Verificar API key antes de chamar (debug)
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY não encontrada no servidor')
      return NextResponse.json(
        { 
          error: 'API Key não configurada. Verifique .env.local e reinicie o servidor.',
          details: 'A variável OPENAI_API_KEY não está disponível no servidor'
        },
        { status: 500 }
      )
    }
    
    console.log('✅ API Key encontrada, iniciando análise com IA...')
    
    // Analisar com IA
    const briefing = await analyzeImportWithAI(excelStructure, description)

    return NextResponse.json({
      success: true,
      briefing,
      excelStructure: {
        headers,
        rowCount: rows.length,
        fileInfo: excelStructure.fileInfo
      }
    })

  } catch (error: any) {
    console.error('Erro ao analisar importação:', error)
    console.error('Stack trace:', error.stack)
    
    // Verificar se é erro de API key
    if (error.message?.includes('OPENAI_API_KEY') || !process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY não configurada no servidor')
      return NextResponse.json(
        { 
          error: 'API Key da OpenAI não configurada. Adicione OPENAI_API_KEY no arquivo .env.local e REINICIE o servidor.',
          details: 'Reinicie o servidor após adicionar a variável de ambiente'
        },
        { status: 500 }
      )
    }

    // Verificar se é erro da API OpenAI
    if (error.response || error.status) {
      console.error('Erro da API OpenAI:', error.status, error.message)
      return NextResponse.json(
        { 
          error: 'Erro ao conectar com a API da OpenAI', 
          details: error.message || 'Verifique sua API key e conexão com internet'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Erro ao analisar importação', 
        details: error.message || 'Erro desconhecido',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

