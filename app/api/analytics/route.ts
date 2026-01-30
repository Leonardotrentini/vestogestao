import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateCompanyKPIs, calculateUserPerformance, getCachedMetric, cacheMetric } from '@/lib/analytics/calculate-metrics'

/**
 * GET /api/analytics
 * Retorna métricas gerais
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const workspaceId = searchParams.get('workspaceId')
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || 'monthly' // daily, weekly, monthly
    const useCache = searchParams.get('useCache') !== 'false'

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId é obrigatório' },
        { status: 400 }
      )
    }

    // Calcular período
    const now = new Date()
    let periodStart: Date
    let periodEnd = new Date(now)

    switch (period) {
      case 'daily':
        periodStart = new Date(now)
        periodStart.setHours(0, 0, 0, 0)
        break
      case 'weekly':
        periodStart = new Date(now)
        periodStart.setDate(now.getDate() - 7)
        break
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3)
        periodStart = new Date(now.getFullYear(), quarter * 3, 1)
        break
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Verificar cache se solicitado
    if (useCache && userId) {
      const cached = await getCachedMetric(
        'user_performance',
        userId,
        periodStart,
        periodEnd,
        period
      )

      if (cached && isCacheValid(cached.calculated_at)) {
        return NextResponse.json({
          ...cached.metrics,
          cached: true,
          calculatedAt: cached.calculated_at
        })
      }
    }

    // Se userId fornecido, retornar performance individual
    if (userId) {
      const metrics = await calculateUserPerformance(userId, periodStart, periodEnd)
      
      // Cachear se solicitado
      if (useCache) {
        await cacheMetric(
          'user_performance',
          userId,
          periodStart,
          periodEnd,
          period,
          metrics
        )
      }

      return NextResponse.json({
        ...metrics,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString(),
          type: period
        },
        cached: false
      })
    }

    // Caso contrário, retornar KPIs da empresa
    const kpis = await calculateCompanyKPIs(workspaceId, periodStart, periodEnd)
    
    // Cachear se solicitado
    if (useCache) {
      await cacheMetric(
        'company_kpi',
        workspaceId,
        periodStart,
        periodEnd,
        period,
        kpis
      )
    }

    return NextResponse.json({
      ...kpis,
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
        type: period
      },
      cached: false
    })

  } catch (error: any) {
    console.error('Erro ao calcular métricas:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular métricas', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Verifica se cache ainda é válido (últimas 1 hora)
 */
function isCacheValid(calculatedAt: string): boolean {
  const cacheTime = new Date(calculatedAt).getTime()
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  return (now - cacheTime) < oneHour
}


