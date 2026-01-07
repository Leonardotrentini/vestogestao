import { createClient } from '@/lib/supabase/server'
import { notifyDeadlineAlert } from './notifications'

/**
 * Verifica prazos e cria notificações para tarefas que vencem em menos de 24h
 * Versão server-side que pode ser usada em API routes
 */
export async function checkDeadlinesServer() {
  const supabase = await createClient()
  const { getDefaultUserId } = await import('@/lib/utils')
  const defaultUserId = getDefaultUserId()

  // Buscar todas as colunas do tipo 'date'
  const { data: dateColumns } = await supabase
    .from('columns')
    .select('id, board_id')
    .eq('type', 'date')

  if (!dateColumns || dateColumns.length === 0) {
    return
  }

  const columnIds = dateColumns.map(col => col.id)

  // Buscar todos os valores de data que têm data de fim
  const { data: dateValues } = await supabase
    .from('column_values')
    .select('*, items(id, name, user_id, groups(id, board_id))')
    .in('column_id', columnIds)

  if (!dateValues) {
    return
  }

  const now = new Date()
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  for (const dateValue of dateValues) {
    try {
      const value = dateValue.value
      if (!value || !value.end) continue

      const endDate = new Date(value.end)
      
      // Verificar se está entre agora e 24h no futuro
      if (endDate > now && endDate <= twentyFourHoursFromNow) {
        const item = (dateValue as any).items
        if (!item) continue

        const userId = item.user_id || defaultUserId
        const boardId = (item as any).groups?.board_id

        // Verificar se já existe notificação recente para este item e usuário
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('item_id', item.id)
          .eq('type', 'deadline_alert')
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Última hora
          .single()

        if (!existingNotification) {
          await notifyDeadlineAlert(
            userId,
            item.id,
            item.name,
            endDate,
            boardId
          )
        }
      }
    } catch (error) {
      console.error('Erro ao verificar prazo:', error)
    }
  }
}










