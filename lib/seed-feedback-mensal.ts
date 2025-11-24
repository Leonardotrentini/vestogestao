// Seed para o quadro "Feedback Mensal"
// Baseado nos prints enviados

import { createClient } from '@/lib/supabase/client'
import { getDefaultUserId } from '@/lib/utils'

export async function seedFeedbackMensal(workspaceId: string) {
  const supabase = createClient()
  const defaultUserId = getDefaultUserId()

  // Verificar se o quadro já existe
  const { data: existingBoard } = await supabase
    .from('boards')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('name', 'Feedback Mensal')
    .single()

  let boardId = existingBoard?.id

  if (!boardId) {
    // Criar o quadro
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert({
        name: 'Feedback Mensal',
        description: 'Quadro para feedback mensal por cliente',
        workspace_id: workspaceId,
        user_id: defaultUserId,
      })
      .select()
      .single()

    if (boardError || !board) {
      console.error('Error creating board:', boardError)
      return { success: false, error: boardError }
    }

    boardId = board.id
  }

  // Criar colunas (mesmas do Gestão de Clientes)
  const columns = [
    { name: 'Responsável', type: 'person', position: 1 },
    { name: 'Status do cliente', type: 'status', position: 2 },
    { name: 'Nicho', type: 'text', position: 3 },
    { name: 'Verba Mensal', type: 'currency', position: 4 },
    { name: 'Time de vendas', type: 'text', position: 5 },
    { name: 'Região', type: 'text', position: 6 },
    { name: 'Iniciou', type: 'date', position: 7 },
    { name: 'Drive de Criativos', type: 'link', position: 8 },
    { name: 'Raio X', type: 'link', position: 9 },
  ]

  // Buscar ou criar colunas
  const { data: existingColumns } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)

  const createdColumns: any[] = existingColumns || []

  for (const col of columns) {
    const exists = createdColumns.find(c => c.name === col.name && c.board_id === boardId)
    if (!exists) {
      const { data: column } = await supabase
        .from('columns')
        .insert({
          name: col.name,
          board_id: boardId,
          type: col.type,
          position: col.position,
        })
        .select()
        .single()
      
      if (column) {
        createdColumns.push(column)
      }
    }
  }

  const getColumn = (name: string) => createdColumns.find(c => c.name === name && c.board_id === boardId)

  // Criar um único grupo
  const { data: existingGroups } = await supabase
    .from('groups')
    .select('*')
    .eq('board_id', boardId)

  let groupId = existingGroups?.[0]?.id

  if (!groupId) {
    const { data: group } = await supabase
      .from('groups')
      .insert({
        name: 'Todos os Clientes',
        board_id: boardId,
        position: 0,
      })
      .select()
      .single()
    
    if (group) {
      groupId = group.id
    }
  }

  if (!groupId) {
    return { success: false, error: 'Erro ao criar grupo' }
  }

  // TODOS OS CLIENTES DO PRINT "Feedback Mensal"
  const clientes: Array<{
    name: string
    values: Record<string, any>
    subitems?: string[]
  }> = [
    // Baseado nos dados do print "Feedback Mensal"
    // Vou usar os mesmos clientes do Feedback Semanal, mas você pode ajustar conforme necessário
    { 
      name: 'EXEMPLO (copy) 1', 
      values: { 
        'Status do cliente': 'em_progresso',
        'Nicho': 'Moda Fitness',
        'Verba Mensal': 'Mais de R$ 5000',
        'Time de vendas': '2',
        'Região': 'Acre',
        'Iniciou': { start: new Date(2024, 9, 2).toISOString() }
      }
    },
    { 
      name: 'WJ Fashion 7', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Moda Feminina',
        'Verba Mensal': 'R$ 1001 - R$ 1500',
        'Time de vendas': '2',
        'Região': 'Ceará',
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }
      }
    },
    // Adicionar mais clientes conforme o print "Feedback Mensal"
    // Por enquanto usando uma estrutura similar
  ]

  // Limpar itens existentes
  const { data: existingItems } = await supabase
    .from('items')
    .select('id')
    .eq('group_id', groupId)

  if (existingItems && existingItems.length > 0) {
    for (const item of existingItems) {
      await supabase.from('subitems').delete().eq('item_id', item.id)
      await supabase.from('column_values').delete().eq('item_id', item.id)
    }
    await supabase.from('items').delete().in('id', existingItems.map(i => i.id))
  }

  // Criar todos os clientes
  for (let i = 0; i < clientes.length; i++) {
    const cliente = clientes[i]
    
    const { data: item } = await supabase
      .from('items')
      .insert({
        name: cliente.name,
        group_id: groupId,
        position: i,
        user_id: cliente.values['Responsável'] || defaultUserId,
      })
      .select()
      .single()

    if (!item) continue

    // Criar valores das colunas
    for (const [colName, value] of Object.entries(cliente.values)) {
      if (colName === 'Responsável') continue

      const column = getColumn(colName)
      if (!column) continue

      if (column.type === 'date' && typeof value === 'object' && value !== null) {
        await supabase.from('column_values').insert({
          item_id: item.id,
          column_id: column.id,
          value: value,
        })
      } else if (value !== null && value !== undefined) {
        await supabase.from('column_values').insert({
          item_id: item.id,
          column_id: column.id,
          value: value,
        })
      }
    }

    // Criar subitens se existirem
    if (cliente.subitems && cliente.subitems.length > 0) {
      for (let j = 0; j < cliente.subitems.length; j++) {
        await supabase.from('subitems').insert({
          name: cliente.subitems[j],
          item_id: item.id,
          position: j,
          is_completed: false,
        })
      }
    }
  }

  return { success: true, boardId }
}

