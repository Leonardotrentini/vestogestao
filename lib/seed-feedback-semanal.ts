// Seed para o quadro "Feedback Semanal Por Cliente"
// Baseado nos prints enviados

import { createClient } from '@/lib/supabase/client'
import { getDefaultUserId } from '@/lib/utils'

export async function seedFeedbackSemanal(workspaceId: string) {
  const supabase = createClient()
  const defaultUserId = getDefaultUserId()

  // Verificar se o quadro já existe
  const { data: existingBoard } = await supabase
    .from('boards')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('name', 'Feedback Semanal Por Cliente')
    .single()

  let boardId = existingBoard?.id

  if (!boardId) {
    // Criar o quadro
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert({
        name: 'Feedback Semanal Por Cliente',
        description: 'Quadro para feedback semanal por cliente',
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

  // Criar um único grupo (sem grupos separados, todos os clientes juntos)
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

  // TODOS OS CLIENTES DO PRINT "Feedback Semanal Por Cliente"
  const clientes: Array<{
    name: string
    values: Record<string, any>
    subitems?: string[]
  }> = [
    { 
      name: 'Sharp', 
      values: { 
        'Status do cliente': 'precisa_atencao'
      } 
    },
    { 
      name: 'Sierra 4', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Multimarcas',
        'Verba Mensal': 'Mais de R$ 5000',
        'Time de vendas': '6-10',
        'Região': 'Santa Catarina',
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }
      }
    },
    { 
      name: 'Vest Atacado', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Multimarcas',
        'Verba Mensal': 'R$ 1501 - R$ 2000',
        'Time de vendas': '2',
        'Região': 'Goiás',
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }
      }
    },
    { 
      name: 'Eradino Atacado 4', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Multimarcas',
        'Verba Mensal': 'R$ 700 - R$ 1000',
        'Time de vendas': '2',
        'Região': 'São Paulo',
        'Iniciou': { start: new Date(2024, 5, 10).toISOString() }
      }
    },
    { 
      name: 'Bauer Shop Atacado 4', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Multimarcas',
        'Verba Mensal': 'Mais de R$ 5000',
        'Time de vendas': '6-10',
        'Região': 'Santa Catarina',
        'Iniciou': { start: new Date(2024, 11, 1).toISOString() }
      }
    },
    { 
      name: 'Samere 4', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Multimarcas',
        'Verba Mensal': 'R$ 3000 - R$ 5000',
        'Time de vendas': '2',
        'Região': 'Minas Gerais'
      }
    },
    { 
      name: 'DyCamisetas 4', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Multimarcas',
        'Verba Mensal': 'R$ 3000 - R$ 5000',
        'Time de vendas': '2',
        'Região': 'São Paulo'
      }
    },
    { 
      name: 'Outlet Camisetas 4', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Multimarcas',
        'Verba Mensal': 'Mais de R$ 5000',
        'Time de vendas': '2',
        'Região': 'São Paulo',
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }
      }
    },
    { 
      name: 'Dinno Grifes 4', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Multimarcas',
        'Verba Mensal': 'Mais de R$ 5000',
        'Time de vendas': '2',
        'Região': 'São Paulo',
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }
      }
    },
    { 
      name: 'Moça charmosa 5', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Moda Feminina',
        'Verba Mensal': 'R$ 1001 - R$ 1500',
        'Time de vendas': '2',
        'Região': 'Ceará',
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }
      }
    },
    { 
      name: 'WJ Fashion 4', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Moda Feminina',
        'Verba Mensal': 'R$ 1001 - R$ 1500',
        'Time de vendas': '2',
        'Região': 'Ceará',
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }
      }
    },
    { 
      name: 'Acaso Fitness 4', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Moda Feminina',
        'Verba Mensal': 'R$ 1001 - R$ 1500',
        'Time de vendas': '2',
        'Região': 'Ceará'
      }
    },
    { 
      name: 'Leny Fashion 4', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Moda Feminina',
        'Verba Mensal': 'R$ 1001 - R$ 1500',
        'Time de vendas': '2',
        'Região': 'Ceará',
        'Iniciou': { start: new Date(2024, 0, 7).toISOString() }
      }
    },
    { 
      name: 'PEP OFICIAL - ERIKA 6', 
      values: { 
        'Status do cliente': 'em_progresso',
        'Nicho': 'Moda Fitness',
        'Verba Mensal': 'R$ 1001 - R$ 1500',
        'Time de vendas': '2',
        'Região': 'Pernambuco',
        'Iniciou': { start: new Date(2024, 0, 9).toISOString() }
      }
    },
    { 
      name: 'Rei das Tshirts (Erick)', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Multimarcas',
        'Verba Mensal': 'Mais de R$ 5000',
        'Time de vendas': '2',
        'Região': 'São Paulo'
      }
    },
    { 
      name: 'Dr Store', 
      values: { 
        'Status do cliente': 'em_progresso',
        'Nicho': 'Moda Feminina',
        'Verba Mensal': 'R$ 1001 - R$ 1500',
        'Time de vendas': '2',
        'Região': 'Ceará',
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }
      }
    },
    { 
      name: 'Soul Chic', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Moda Feminina',
        'Verba Mensal': 'R$ 1001 - R$ 1500',
        'Time de vendas': '2',
        'Região': 'Ceará',
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }
      }
    },
    { 
      name: 'Flor de Miss', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Moda Feminina',
        'Verba Mensal': 'R$ 700 - R$ 1000',
        'Time de vendas': '2',
        'Região': 'Ceará'
      }
    },
    { 
      name: 'WK Jeans', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Jeans',
        'Verba Mensal': 'R$ 1001 - R$ 1500',
        'Time de vendas': '2',
        'Região': 'Ceará'
      }
    },
    { 
      name: 'Jeitinho de Lara', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Moda Feminina',
        'Verba Mensal': 'R$ 2000 - R$ 3000',
        'Time de vendas': '10-20',
        'Região': 'Ceará'
      }
    },
    { 
      name: 'Ser Kids', 
      values: { 
        'Status do cliente': 'em_progresso',
        'Nicho': 'Moda infantil',
        'Verba Mensal': 'R$ 1501 - R$ 2000',
        'Time de vendas': '2',
        'Região': 'Paraná'
      }
    },
    { 
      name: 'Viiibe', 
      values: { 
        'Status do cliente': 'em_progresso',
        'Nicho': 'Marca Própria',
        'Verba Mensal': 'R$ 1001 - R$ 1500',
        'Time de vendas': '2',
        'Região': 'Santa Catarina'
      }
    },
    { 
      name: 'All men', 
      values: { 
        'Status do cliente': 'faturando',
        'Nicho': 'Moda Masculina',
        'Verba Mensal': 'R$ 1001 - R$ 1500',
        'Time de vendas': '2',
        'Região': 'São Paulo'
      }
    },
    { 
      name: 'EXEMPLO', 
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
      name: 'OMG - TEXTIL 1', 
      values: { 
        'Status do cliente': 'em_progresso'
      }
    },
    { 
      name: 'Sharp', 
      values: { 
        'Status do cliente': 'precisa_atencao'
      } 
    },
    { 
      name: 'StyloPróprio 1', 
      values: { 
        'Status do cliente': 'em_progresso',
        'Nicho': 'Moda Feminina',
        'Verba Mensal': 'R$ 1501 - R$ 2000',
        'Time de vendas': '1'
      }
    },
    { 
      name: 'XHX Jeans 1', 
      values: { 
        'Status do cliente': 'em_progresso',
        'Nicho': 'Jeans',
        'Verba Mensal': 'R$ 1001 - R$ 1500',
        'Time de vendas': '1',
        'Região': 'Pernambuco'
      }
    },
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

