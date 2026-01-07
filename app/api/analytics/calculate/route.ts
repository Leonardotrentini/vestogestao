import { NextRequest, NextResponse } from 'next/server'
import { calculateUserPerformance, calculateCompanyKPIs, cacheMetric } from '@/lib/analytics/calculate-metrics'

/**
 * POST /api/analytics/calculate
 * Força recalcular e cachear métricas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      metricType, 
      entityId, 
      workspaceId,
      periodStart, 
      periodEnd, 
      periodType = 'monthly' 
    } = body

    if (!metricType) {
      return NextResponse.json(
        { error: 'metricType é obrigatório' },
        { status: 400 }
      )
    }

    const startDate = new Date(periodStart || new Date().toISOString())
    const endDate = new Date(periodEnd || new Date().toISOString())

    let metrics

    switch (metricType) {
      case 'user_performance':
        if (!entityId) {
          return NextResponse.json(
            { error: 'entityId (userId) é obrigatório para user_performance' },
            { status: 400 }
          )
        }
        metrics = await calculateUserPerformance(entityId, startDate, endDate)
        await cacheMetric(metricType, entityId, startDate, endDate, periodType, metrics)
        break

      case 'company_kpi':
        if (!workspaceId && !entityId) {
          return NextResponse.json(
            { error: 'workspaceId ou entityId é obrigatório para company_kpi' },
            { status: 400 }
          )
        }
        const wsId = workspaceId || entityId
        metrics = await calculateCompanyKPIs(wsId, startDate, endDate)
        await cacheMetric(metricType, wsId, startDate, endDate, periodType, metrics)
        break

      default:
        return NextResponse.json(
          { error: 'metricType inválido' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      metricType,
      entityId: entityId || workspaceId,
      metrics,
      cached: true
    })

  } catch (error: any) {
    console.error('Erro ao calcular métricas:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular métricas', details: error.message },
      { status: 500 }
    )
  }
}

