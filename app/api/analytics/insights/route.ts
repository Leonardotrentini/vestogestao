import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/analytics/insights
 * Retorna insights de IA
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const insightType = searchParams.get('type') || 'weekly_summary'
    const entityId = searchParams.get('entityId')
    const workspaceId = searchParams.get('workspaceId')
    const userId = searchParams.get('userId')

    const supabase = await createClient()

    // Construir query
    let query = supabase
      .from('ai_insights')
      .select('*')
      .eq('insight_type', insightType)
      .eq('status', 'active')
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false })

    if (entityId) {
      query = query.eq('entity_id', entityId)
    } else if (workspaceId) {
      query = query.eq('entity_id', workspaceId)
    } else if (userId) {
      query = query.eq('entity_id', userId)
    }

    const { data, error } = await query.limit(10)

    if (error) {
      throw error
    }

    return NextResponse.json({
      insights: data || [],
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('Erro ao buscar insights:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar insights', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/analytics/insights
 * Gera novo insight de IA (placeholder - integração completa será feita depois)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      insightType = 'weekly_summary',
      entityId,
      periodStart,
      periodEnd,
      // rawData será usado para gerar o insight
      rawData = {}
    } = body

    const supabase = await createClient()

    // TODO: Integrar com OpenAI/Anthropic para gerar insights
    // Por enquanto, retornamos um placeholder

    const placeholderContent = `
Análise gerada em ${new Date().toLocaleDateString('pt-BR')}.

**Resumo:**
Esta é uma versão preliminar do sistema de insights de IA. A integração completa com modelos de IA será implementada em breve.

**Dados analisados:**
- Tipo: ${insightType}
- Período: ${periodStart || 'N/A'} a ${periodEnd || 'N/A'}
- Entidade: ${entityId || 'Geral'}

Para gerar insights reais, será necessário:
1. Configurar chave de API (OpenAI ou Anthropic)
2. Preparar prompt com dados agregados
3. Processar resposta e salvar no banco
    `.trim()

    // Salvar insight no banco
    const { data, error } = await supabase
      .from('ai_insights')
      .insert({
        insight_type: insightType,
        entity_id: entityId || null,
        period_start: periodStart ? new Date(periodStart).toISOString().split('T')[0] : null,
        period_end: periodEnd ? new Date(periodEnd).toISOString().split('T')[0] : null,
        content: placeholderContent,
        raw_data: rawData,
        ai_model: 'placeholder',
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      insight: data,
      message: 'Insight criado (placeholder - integração IA pendente)'
    })

  } catch (error: any) {
    console.error('Erro ao gerar insight:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar insight', details: error.message },
      { status: 500 }
    )
  }
}

