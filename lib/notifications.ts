import { createClient } from '@/lib/supabase/client'

export interface NotificationData {
  user_id: string
  type: 'assignment' | 'mention' | 'deadline' | 'deadline_alert'
  title: string
  message?: string
  item_id?: string
  board_id?: string
}

/**
 * Cria uma notificação para um usuário
 */
export async function createNotification(data: NotificationData) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      item_id: data.item_id,
      board_id: data.board_id,
      is_read: false,
    })

  if (error) {
    console.error('Erro ao criar notificação:', error)
    return false
  }

  return true
}

/**
 * Cria notificação quando um usuário é atribuído a uma tarefa
 */
export async function notifyUserAssignment(
  userId: string,
  itemId: string,
  itemName: string,
  boardId?: string
) {
  return await createNotification({
    user_id: userId,
    type: 'assignment',
    title: 'Você foi atribuído a uma tarefa',
    message: `Você foi atribuído à tarefa "${itemName}"`,
    item_id: itemId,
    board_id: boardId,
  })
}

/**
 * Cria notificação quando um usuário é mencionado
 */
export async function notifyMention(
  userId: string,
  itemId: string,
  itemName: string,
  commentContent: string,
  boardId?: string
) {
  return await createNotification({
    user_id: userId,
    type: 'mention',
    title: 'Você foi mencionado',
    message: `Você foi mencionado na tarefa "${itemName}": ${commentContent.substring(0, 100)}...`,
    item_id: itemId,
    board_id: boardId,
  })
}

/**
 * Cria notificação de prazo próximo (menos de 24h)
 */
export async function notifyDeadlineAlert(
  userId: string,
  itemId: string,
  itemName: string,
  deadlineDate: Date,
  boardId?: string
) {
  const hoursLeft = Math.floor((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60))
  
  return await createNotification({
    user_id: userId,
    type: 'deadline_alert',
    title: 'Prazo próximo!',
    message: `A tarefa "${itemName}" vence em menos de ${hoursLeft} horas`,
    item_id: itemId,
    board_id: boardId,
  })
}

/**
 * Extrai menções (@usuario) de um texto
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }

  return [...new Set(mentions)] // Remove duplicatas
}

/**
 * Verifica prazos e cria notificações para tarefas que vencem em menos de 24h
 * Esta função deve ser chamada via API route (server-side)
 */
export async function checkDeadlines() {
  // Chamar API route que executa no server-side
  try {
    const response = await fetch('/api/check-deadlines', { method: 'GET' })
    if (!response.ok) {
      console.error('Erro ao verificar prazos via API')
    }
  } catch (error) {
    console.error('Erro ao chamar API de verificação de prazos:', error)
  }
}

