import { NextResponse } from 'next/server'
import { extractSpreadsheetId, fetchDashboardData } from '@/lib/google-sheets/client'
import { processDashboardData } from '@/lib/google-sheets/process-data'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let spreadsheetId = searchParams.get('spreadsheetId')
    const spreadsheetUrl = searchParams.get('spreadsheetUrl')
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')
    const campaign = searchParams.get('campaign')
    const responsible = searchParams.get('responsible')
    const gastosTotalParam = searchParams.get('gastosTotal')
    const gastosTotal = gastosTotalParam ? parseFloat(gastosTotalParam) : undefined
    
    console.log('📥 API recebeu parâmetros:', {
      spreadsheetId,
      gastosTotal,
      dateStart,
      dateEnd,
      campaign,
      responsible
    })

    // Se vier URL, extrair o ID
    if (spreadsheetUrl && !spreadsheetId) {
      spreadsheetId = extractSpreadsheetId(spreadsheetUrl)
    }

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'spreadsheetId ou spreadsheetUrl é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar dados do Google Sheets
    const rawData = await fetchDashboardData(spreadsheetId)

    // Processar e calcular métricas
    const processedData = processDashboardData(
      rawData.leads,
      rawData.investimento,
      rawData.metas,
      dateStart || undefined,
      dateEnd || undefined,
      campaign || undefined,
      responsible || undefined,
      gastosTotal // Passar gastosTotal diretamente da aplicação
    )

    return NextResponse.json(processedData)
  } catch (error: any) {
    console.error('Erro ao buscar dados do Google Sheets:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar dados do Google Sheets' },
      { status: 500 }
    )
  }
}
