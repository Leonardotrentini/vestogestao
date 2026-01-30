import { NextResponse } from 'next/server'
import { readSheetRange } from '@/lib/google-sheets/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { spreadsheetId, metas } = body

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'spreadsheetId é obrigatório' },
        { status: 400 }
      )
    }

    if (!metas || !Array.isArray(metas)) {
      return NextResponse.json(
        { error: 'metas deve ser um array' },
        { status: 400 }
      )
    }

    // Por enquanto, apenas retornar sucesso
    // A escrita direta no Google Sheets via API pública não é possível
    // O usuário precisará editar manualmente na planilha [CONFIG] Metas
    // Ou usar a API oficial do Google Sheets com autenticação
    
    console.log('Metas que seriam salvas:', metas)
    console.log('⚠️ Para salvar automaticamente, é necessário usar a API oficial do Google Sheets com autenticação')

    return NextResponse.json({ 
      success: true,
      message: 'Metas processadas. Para salvar automaticamente, configure a API oficial do Google Sheets.'
    })
  } catch (error: any) {
    console.error('Erro ao salvar metas:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao salvar metas' },
      { status: 500 }
    )
  }
}
