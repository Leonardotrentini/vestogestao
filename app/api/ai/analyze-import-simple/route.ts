import { NextRequest, NextResponse } from 'next/server'
import { analyzeExcelSimple } from '@/lib/analytics/analyze-excel-simple'
import { ExcelStructure } from '@/types/briefing'

/**
 * POST /api/ai/analyze-import-simple
 * Analisa um arquivo Excel SEM usar IA (gratuito)
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

    // Pegar amostra de até 10 linhas para análise
    const sampleRows = rows.slice(0, 10).map(row => 
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

    // Analisar SEM IA (gratuito)
    const briefing = analyzeExcelSimple(excelStructure, description || undefined)

    return NextResponse.json({
      success: true,
      briefing,
      excelStructure: {
        headers,
        rowCount: rows.length,
        fileInfo: excelStructure.fileInfo
      },
      note: 'Análise realizada sem IA (gratuito). Para análise mais inteligente, use a versão com IA.'
    })

  } catch (error: any) {
    console.error('Erro ao analisar importação:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao analisar importação', 
        details: error.message || 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}


