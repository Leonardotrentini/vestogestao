import { createClient } from '@/lib/supabase/server'

export interface UserPerformanceMetrics {
  tasksCompleted: number
  tasksAssigned: number
  completionRate: number
  hoursWorked: number
  tasksPerHour: number
  deadlinesMet: number
  deadlinesTotal: number
  deadlineCompliance: number
  averageCompletionTime: number // dias
  commentsCount: number
  engagementScore: number
}

export interface CompanyKPIMetrics {
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  inProgressTasks: number
  overallCompletionRate: number
  averageCompletionTime: number
  totalHoursTracked: number
  throughput: number // tarefas/dia
}

/**
 * Calcula métricas de performance de um usuário
 */
export async function calculateUserPerformance(
  userId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<UserPerformanceMetrics> {
  const supabase = await createClient()

  // 1. Buscar tarefas atribuídas ao usuário no período
  const { data: assignedItems } = await supabase
    .from('items')
    .select('id, name, created_at, updated_at')
    .eq('user_id', userId)
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString())

  // 2. Buscar valores de colunas de status para calcular completados
  const itemIds = assignedItems?.map(item => item.id) || []
  
  if (itemIds.length === 0) {
    return getEmptyUserMetrics()
  }

  // Buscar colunas de status
  const { data: statusColumns } = await supabase
    .from('columns')
    .select('id')
    .eq('type', 'status')
    .limit(1)
    .single()

  let completedCount = 0
  let totalAssigned = assignedItems?.length || 0

  if (statusColumns) {
    const { data: statusValues } = await supabase
      .from('column_values')
      .select('item_id, value')
      .in('item_id', itemIds)
      .eq('column_id', statusColumns.id)

    // Contar itens com status "Finalizado"
    completedCount = statusValues?.filter(
      sv => sv.value === 'Finalizado' || sv.value === 'Completo'
    ).length || 0
  }

  // 3. Buscar tempo trabalhado
  const { data: timeTracking } = await supabase
    .from('time_tracking')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString())

  const totalSeconds = timeTracking?.reduce(
    (sum, tt) => sum + (tt.duration_seconds || 0),
    0
  ) || 0
  const hoursWorked = totalSeconds / 3600

  // 4. Buscar comentários
  const { data: comments } = await supabase
    .from('comments')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString())

  const commentsCount = comments?.length || 0

  // 5. Calcular prazos (se houver coluna de data)
  const { data: dateColumns } = await supabase
    .from('columns')
    .select('id')
    .eq('type', 'date')
    .limit(1)
    .single()

  let deadlinesMet = 0
  let deadlinesTotal = 0

  if (dateColumns) {
    const { data: dateValues } = await supabase
      .from('column_values')
      .select('item_id, value')
      .in('item_id', itemIds)
      .eq('column_id', dateColumns.id)

    deadlinesTotal = dateValues?.length || 0
    
    // Verificar se data de fim está no passado e item está completo
    const now = new Date()
    for (const dv of dateValues || []) {
      if (dv.value && typeof dv.value === 'object' && 'end' in dv.value) {
        const endDate = new Date(dv.value.end)
        if (endDate <= now) {
          // Verificar se está completo
          const isCompleted = itemIds.includes(dv.item_id) && 
            statusValues?.some(sv => sv.item_id === dv.item_id && 
              (sv.value === 'Finalizado' || sv.value === 'Completo'))
          if (isCompleted) {
            deadlinesMet++
          }
        }
      }
    }
  }

  // 6. Calcular tempo médio de conclusão
  let averageCompletionTime = 0
  if (completedCount > 0) {
    const completedItems = assignedItems?.filter((item, index) => {
      return statusValues?.some(sv => sv.item_id === item.id && 
        (sv.value === 'Finalizado' || sv.value === 'Completo'))
    }) || []

    const totalDays = completedItems.reduce((sum, item) => {
      const created = new Date(item.created_at)
      const updated = new Date(item.updated_at)
      const days = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      return sum + days
    }, 0)

    averageCompletionTime = totalDays / completedCount
  }

  // 7. Calcular engagement score (simplificado)
  const engagementScore = Math.min(
    100,
    (completedCount * 10) + 
    (commentsCount * 2) + 
    (hoursWorked > 0 ? 20 : 0)
  )

  return {
    tasksCompleted: completedCount,
    tasksAssigned: totalAssigned,
    completionRate: totalAssigned > 0 ? (completedCount / totalAssigned) * 100 : 0,
    hoursWorked: Math.round(hoursWorked * 10) / 10,
    tasksPerHour: hoursWorked > 0 ? Math.round((completedCount / hoursWorked) * 100) / 100 : 0,
    deadlinesMet,
    deadlinesTotal,
    deadlineCompliance: deadlinesTotal > 0 ? (deadlinesMet / deadlinesTotal) * 100 : 0,
    averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
    commentsCount,
    engagementScore: Math.min(100, Math.round(engagementScore))
  }
}

/**
 * Calcula KPIs da empresa/workspace
 */
export async function calculateCompanyKPIs(
  workspaceId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<CompanyKPIMetrics> {
  const supabase = await createClient()

  // 1. Buscar todos os boards do workspace
  const { data: boards } = await supabase
    .from('boards')
    .select('id')
    .eq('workspace_id', workspaceId)

  const boardIds = boards?.map(b => b.id) || []

  if (boardIds.length === 0) {
    return getEmptyCompanyMetrics()
  }

  // 2. Buscar todos os grupos dos boards
  const { data: groups } = await supabase
    .from('groups')
    .select('id')
    .in('board_id', boardIds)

  const groupIds = groups?.map(g => g.id) || []

  if (groupIds.length === 0) {
    return getEmptyCompanyMetrics()
  }

  // 3. Buscar todos os itens
  const { data: allItems } = await supabase
    .from('items')
    .select('id, created_at, updated_at')
    .in('group_id', groupIds)

  const totalTasks = allItems?.length || 0
  const itemIds = allItems?.map(item => item.id) || []

  // 4. Buscar colunas de status
  const { data: statusColumns } = await supabase
    .from('columns')
    .select('id, board_id')
    .eq('type', 'status')
    .in('board_id', boardIds)

  let completedTasks = 0
  let pendingTasks = 0
  let inProgressTasks = 0
  let statusValues: any[] = []

  if (statusColumns && statusColumns.length > 0) {
    const statusColumnIds = statusColumns.map(sc => sc.id)
    const { data: statusValuesData } = await supabase
      .from('column_values')
      .select('item_id, value')
      .in('item_id', itemIds)
      .in('column_id', statusColumnIds)

    statusValues = statusValuesData || []

    statusValues.forEach(sv => {
      const status = String(sv.value).toLowerCase()
      if (status.includes('finalizado') || status.includes('completo')) {
        completedTasks++
      } else if (status.includes('aguardo') || status.includes('pendente')) {
        pendingTasks++
      } else if (status.includes('progresso') || status.includes('em andamento')) {
        inProgressTasks++
      }
    })
  }

  // 5. Calcular tempo médio de conclusão
  let averageCompletionTime = 0
  if (completedTasks > 0 && statusValues.length > 0) {
    const completedItemIds = statusValues
      ?.filter(sv => {
        const status = String(sv.value).toLowerCase()
        return status.includes('finalizado') || status.includes('completo')
      })
      .map(sv => sv.item_id) || []

    const completedItems = (allItems || []).filter(item => 
      completedItemIds.includes(item.id)
    )

    const totalDays = completedItems.reduce((sum, item) => {
      const created = new Date(item.created_at)
      const updated = new Date(item.updated_at)
      const days = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      return sum + days
    }, 0)

    averageCompletionTime = totalDays / completedTasks
  }

  // 6. Buscar tempo total trabalhado
  const { data: timeTracking } = await supabase
    .from('time_tracking')
    .select('duration_seconds')
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString())

  const totalSeconds = timeTracking?.reduce(
    (sum, tt) => sum + (tt.duration_seconds || 0),
    0
  ) || 0
  const totalHoursTracked = totalSeconds / 3600

  // 7. Calcular throughput (tarefas/dia)
  const daysDiff = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
  const throughput = daysDiff > 0 ? Math.round((completedTasks / daysDiff) * 100) / 100 : 0

  // 8. Contar projetos ativos (boards não arquivados)
  const activeProjects = boardIds.length

  return {
    totalProjects: boardIds.length,
    activeProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    overallCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
    totalHoursTracked: Math.round(totalHoursTracked * 10) / 10,
    throughput
  }
}

/**
 * Retorna métricas vazias para usuário
 */
function getEmptyUserMetrics(): UserPerformanceMetrics {
  return {
    tasksCompleted: 0,
    tasksAssigned: 0,
    completionRate: 0,
    hoursWorked: 0,
    tasksPerHour: 0,
    deadlinesMet: 0,
    deadlinesTotal: 0,
    deadlineCompliance: 0,
    averageCompletionTime: 0,
    commentsCount: 0,
    engagementScore: 0
  }
}

/**
 * Retorna métricas vazias para empresa
 */
function getEmptyCompanyMetrics(): CompanyKPIMetrics {
  return {
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overallCompletionRate: 0,
    averageCompletionTime: 0,
    totalHoursTracked: 0,
    throughput: 0
  }
}

/**
 * Verifica se métrica já está em cache
 */
export async function getCachedMetric(
  metricType: string,
  entityId: string | null,
  periodStart: Date,
  periodEnd: Date,
  periodType: string
) {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('analytics_metrics')
    .select('*')
    .eq('metric_type', metricType)
    .eq('entity_id', entityId || '')
    .eq('period_start', periodStart.toISOString().split('T')[0])
    .eq('period_end', periodEnd.toISOString().split('T')[0])
    .eq('period_type', periodType)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single()

  return data
}

/**
 * Salva métrica no cache
 */
export async function cacheMetric(
  metricType: string,
  entityId: string | null,
  periodStart: Date,
  periodEnd: Date,
  periodType: string,
  metrics: any
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('analytics_metrics')
    .upsert({
      metric_type: metricType,
      entity_id: entityId,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      period_type: periodType,
      metrics,
      calculated_at: new Date().toISOString()
    }, {
      onConflict: 'metric_type,entity_id,period_start,period_end,period_type'
    })

  if (error) {
    console.error('Erro ao cachear métrica:', error)
    throw error
  }
}

