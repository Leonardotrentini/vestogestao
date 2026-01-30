import { NextRequest, NextResponse } from 'next/server'
import { calculateUserPerformance, getCachedMetric, cacheMetric } from '@/lib/analytics/calculate-metrics'

/**
 * GET /api/analytics/user-performance
 * Retorna métricas de performance de um usuário específico
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || 'monthly'
    const useCache = searchParams.get('useCache') !== 'false'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
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
      case 'yearly':
        periodStart = new Date(now.getFullYear(), 0, 1)
        break
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Verificar cache
    if (useCache) {
      const cached = await getCachedMetric(
        'user_performance',
        userId,
        periodStart,
        periodEnd,
        period
      )

      if (cached && isCacheValid(cached.calculated_at)) {
        return NextResponse.json({
          userId,
          metrics: cached.metrics,
          period: {
            start: periodStart.toISOString(),
            end: periodEnd.toISOString(),
            type: period
          },
          cached: true,
          calculatedAt: cached.calculated_at
        })
      }
    }

    // Calcular métricas
    const metrics = await calculateUserPerformance(userId, periodStart, periodEnd)
    
    // Cachear
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
      userId,
      metrics,
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
        type: period
      },
      cached: false
    })

  } catch (error: any) {
    console.error('Erro ao calcular performance do usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular performance', details: error.message },
      { status: 500 }
    )
  }
}

function isCacheValid(calculatedAt: string): boolean {
  const cacheTime = new Date(calculatedAt).getTime()
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  return (now - cacheTime) < oneHour
}


