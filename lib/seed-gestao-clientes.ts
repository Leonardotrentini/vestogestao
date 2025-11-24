// Seed COMPLETO para o quadro "Gestão de Clientes"
// Baseado em TODOS os prints enviados - TODOS os clientes com dados reais

import { createClient } from '@/lib/supabase/client'
import { getDefaultUserId } from '@/lib/utils'

// Seed COMPLETO baseado nos prints enviados

export async function seedGestaoClientes(workspaceId: string) {
  const supabase = createClient()
  const defaultUserId = getDefaultUserId()

  // Verificar se o quadro já existe
  const { data: existingBoard } = await supabase
    .from('boards')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('name', 'Gestão de Clientes')
    .single()

  let boardId = existingBoard?.id

  if (!boardId) {
    // Criar o quadro
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert({
        name: 'Gestão de Clientes',
        description: 'Sistema completo de gestão de clientes',
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

  // Criar colunas (se não existirem)
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

  // Helper para encontrar coluna
  const getColumn = (name: string) => createdColumns.find(c => c.name === name && c.board_id === boardId)

  // Criar grupos
  const grupos = [
    { name: 'Onboarding', position: 0 },
    { name: 'Contas', position: 1 },
    { name: 'Feedback Semanal', position: 2 },
    { name: 'Feedback Mensal', position: 3 },
  ]

  // Buscar ou criar grupos
  const { data: existingGroups } = await supabase
    .from('groups')
    .select('*')
    .eq('board_id', boardId)

  const createdGroups: any[] = existingGroups || []

  for (const grupo of grupos) {
    const exists = createdGroups.find(g => g.name === grupo.name && g.board_id === boardId)
    if (!exists) {
      const { data: group } = await supabase
        .from('groups')
        .insert({
          name: grupo.name,
          board_id: boardId,
          position: grupo.position,
        })
        .select()
        .single()
      
      if (group) {
        createdGroups.push(group)
      }
    }
  }

  // Atualizar lista de grupos após criar (caso tenha criado novos)
  const { data: updatedGroups } = await supabase
    .from('groups')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true })

  const allGroups = updatedGroups || createdGroups

  const getGroup = (name: string) => allGroups.find(g => g.name === name && g.board_id === boardId)

  // CLIENTES DO GRUPO "ONBOARDING" - Baseado nos prints enviados
  // Os 2 elementos que aparecem no grupo Onboarding
  const clientesOnboarding: Array<{
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
      name: 'Sharp', 
      values: { 
        'Status do cliente': 'precisa_atencao'
      } 
    },
  ]

  // TODOS OS CLIENTES DO GRUPO "CONTAS" - COMPLETO baseado nos prints
  const clientesContas: Array<{
    name: string
    values: Record<string, any>
    subitems?: string[]
  }> = [
    { 
      name: 'Sharp Atacado', 
      values: { 
        'Responsável': defaultUserId, 
        'Status do cliente': 'faturando', 
        'Nicho': 'Multimarcas', 
        'Verba Mensal': '7000', 
        'Time de vendas': '2', 
        'Região': 'Santa Catarina', 
        'Iniciou': { start: new Date(2022, 8, 16).toISOString() }, 
        'Drive de Criativos': 'https://drive.google.com/drive/criativos/sharp', 
        'Raio X': 'https://drive.google.com/drive/raiox/sharp' 
      } 
    },
    { 
      name: 'Sierra Atacado 1', 
      values: { 
        'Status do cliente': 'em_progresso', 
        'Nicho': 'Multimarcas', 
        'Verba Mensal': 'Mais de R$ 5000', 
        'Time de vendas': '6', 
        'Região': 'Santa Catarina', 
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }, 
        'Drive de Criativos': 'https://drive.google.com/drive/criativos/sierra', 
        'Raio X': 'https://drive.google.com/drive/raiox/sierra' 
      },
      subitems: ['Semana 01', 'Semana 02', 'Semana 03', 'Semana 04']
    },
    { 
      name: 'Vest Atacado 1', 
      values: { 
        'Status do cliente': 'em_progresso', 
        'Nicho': 'Multimarcas', 
        'Verba Mensal': 'R$ 2000 - R$ 3000', 
        'Time de vendas': '2', 
        'Região': 'Goiás', 
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }, 
        'Drive de Criativos': 'https://drive.google.com/drive/criativos/vest', 
        'Raio X': 'https://drive.google.com/drive/raiox/vest' 
      } 
    },
    { 
      name: 'Eradino Atacado 1', 
      values: { 
        'Status do cliente': 'em_progresso', 
        'Nicho': 'Multimarcas', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '2', 
        'Região': 'São Paulo', 
        'Iniciou': { start: new Date(2024, 5, 10).toISOString() }, 
        'Drive de Criativos': 'https://drive.google.com/drive/criativos/eradino', 
        'Raio X': 'https://drive.google.com/drive/raiox/eradino' 
      } 
    },
    { 
      name: 'BLU SHOP - ABNER 1', 
      values: { 
        'Status do cliente': 'em_progresso', 
        'Nicho': 'Multimarcas', 
        'Verba Mensal': 'Mais de R$ 5000', 
        'Time de vendas': '6-10', 
        'Região': 'Santa Catarina', 
        'Drive de Criativos': 'https://drive.google.com/drive/criativos/blushop', 
        'Raio X': 'https://drive.google.com/drive/raiox/blushop' 
      } 
    },
    { 
      name: 'DyCamisetas 1', 
      values: { 
        'Status do cliente': 'em_progresso', 
        'Nicho': 'Multimarcas', 
        'Verba Mensal': 'R$ 3000 - R$ 5000', 
        'Time de vendas': '2', 
        'Região': 'São Paulo', 
        'Drive de Criativos': 'https://drive.google.com/drive/criativos/dycamisetas', 
        'Raio X': 'https://drive.google.com/drive/raiox/dycamisetas' 
      } 
    },
    { 
      name: 'Samere 1', 
      values: { 
        'Status do cliente': 'em_progresso', 
        'Nicho': 'Multimarcas', 
        'Verba Mensal': 'R$ 3000 - R$ 5000', 
        'Time de vendas': '2', 
        'Região': 'São Paulo', 
        'Drive de Criativos': 'https://drive.google.com/drive/criativos/samere', 
        'Raio X': 'https://drive.google.com/drive/raiox/samere' 
      } 
    },
    { 
      name: 'Outlet Camisetas', 
      values: { 
        'Status do cliente': 'em_progresso', 
        'Nicho': 'Multimarcas', 
        'Verba Mensal': 'Mais de R$ 5000', 
        'Time de vendas': '2', 
        'Região': 'São Paulo', 
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }, 
        'Drive de Criativos': 'https://drive.google.com/drive/criativos/outlet', 
        'Raio X': 'https://drive.google.com/drive/raiox/outlet' 
      } 
    },
    { 
      name: 'Dino Griffes', 
      values: { 
        'Status do cliente': 'em_progresso', 
        'Nicho': 'Multimarcas', 
        'Verba Mensal': 'Mais de R$ 5000', 
        'Time de vendas': '2', 
        'Região': 'São Paulo', 
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() } 
      } 
    },
    { 
      name: 'Wj Fashion 1', 
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
      name: 'Moça charmosa 4', 
      values: { 
        'Status do cliente': 'faturando', 
        'Nicho': 'Moda Feminina', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '2', 
        'Região': 'Ceará', 
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }, 
        'Raio X': 'https://drive.google.com/drive/raiox/moca' 
      } 
    },
    { 
      name: 'Acaso Fitness', 
      values: { 
        'Status do cliente': 'faturando', 
        'Nicho': 'Moda Feminina', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '2', 
        'Região': 'Pernambuco' 
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
        'Iniciou': { start: new Date(2024, 0, 7).toISOString() }, 
        'Raio X': 'https://drive.google.com/drive/raiox/leny' 
      } 
    },
    { 
      name: 'PEP OFICIAL - ERIKA 1', 
      values: { 
        'Status do cliente': 'faturando', 
        'Nicho': 'Moda Fitness', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '2', 
        'Região': 'Pernambuco', 
        'Iniciou': { start: new Date(2024, 0, 9).toISOString() }, 
        'Raio X': 'https://drive.google.com/drive/raiox/pep' 
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
      name: 'Mundo Fantasia 1', 
      values: { 
        'Responsável': defaultUserId, 
        'Status do cliente': 'faturando', 
        'Nicho': 'Marca Própria', 
        'Verba Mensal': 'R$ 2000 - R$ 3000', 
        'Time de vendas': '2', 
        'Região': 'São Paulo', 
        'Raio X': 'https://drive.google.com/drive/raiox/mundo' 
      } 
    },
    { 
      name: 'Suave (Léo) 1', 
      values: { 
        'Status do cliente': 'em_progresso', 
        'Nicho': 'Marca Própria', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '2', 
        'Região': 'Ceará', 
        'Raio X': 'https://drive.google.com/drive/raiox/suave' 
      } 
    },
    { 
      name: 'Dr Store 1', 
      values: { 
        'Status do cliente': 'faturando', 
        'Nicho': 'Moda Feminina', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '2', 
        'Região': 'Ceará', 
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }, 
        'Raio X': 'https://drive.google.com/drive/raiox/drstore' 
      } 
    },
    { 
      name: 'Soul Chic 1', 
      values: { 
        'Status do cliente': 'faturando', 
        'Nicho': 'Moda Feminina', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '2', 
        'Região': 'Alagoas', 
        'Iniciou': { start: new Date(2024, 5, 5).toISOString() }, 
        'Raio X': 'https://drive.google.com/drive/raiox/soul' 
      } 
    },
    { 
      name: 'Flor de Miss 1', 
      values: { 
        'Status do cliente': 'faturando', 
        'Nicho': 'Moda Feminina', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '2', 
        'Região': 'Pernambuco', 
        'Raio X': 'https://drive.google.com/drive/raiox/flor' 
      } 
    },
    { 
      name: 'WK Jeans 2', 
      values: { 
        'Status do cliente': 'faturando', 
        'Nicho': 'Jeans', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '2', 
        'Região': 'Pernambuco', 
        'Raio X': 'https://drive.google.com/drive/raiox/wk' 
      } 
    },
    { 
      name: 'Ser Kids 1', 
      values: { 
        'Status do cliente': 'faturando', 
        'Nicho': 'Moda infantil', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '2', 
        'Região': 'Santa Catarina', 
        'Raio X': 'https://drive.google.com/drive/raiox/serkids' 
      } 
    },
    { 
      name: 'All Men 1', 
      values: { 
        'Status do cliente': 'faturando', 
        'Nicho': 'Multimarcas', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '2', 
        'Região': 'Santa Catarina' 
      } 
    },
    { 
      name: 'Use.Lily 1', 
      values: { 
        'Status do cliente': 'em_progresso', 
        'Nicho': 'Moda Feminina', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '2', 
        'Região': 'Pernambuco', 
        'Raio X': 'https://drive.google.com/drive/raiox/uselily' 
      } 
    },
    { 
      name: 'StyloPróprio (copy) 1', 
      values: { 
        'Status do cliente': 'em_progresso', 
        'Nicho': 'Moda Feminina', 
        'Verba Mensal': 'R$ 1501 - R$ 2000', 
        'Time de vendas': '1', 
        'Região': 'Ceará', 
        'Iniciou': { start: new Date(2024, 10, 6).toISOString() }, 
        'Raio X': 'https://drive.google.com/drive/raiox/stylo' 
      } 
    },
    { 
      name: 'XHX Jeans (copy) 1', 
      values: { 
        'Status do cliente': 'em_progresso', 
        'Nicho': 'Jeans', 
        'Verba Mensal': 'R$ 1001 - R$ 1500', 
        'Time de vendas': '1', 
        'Região': 'Pernambuco', 
        'Raio X': 'https://drive.google.com/drive/raiox/xhx' 
      } 
    },
    { 
      name: 'LOVELUBRAND', 
      values: { 
        'Status do cliente': 'faturando', 
        'Nicho': 'Marca Própria' 
      } 
    },
    { 
      name: 'OMG - TEXTIL (copy) 1', 
      values: { 
        'Status do cliente': 'em_progresso' 
      } 
    },
    { 
      name: 'Home Lisas', 
      values: { 
        'Status do cliente': 'precisa_atencao' 
      } 
    },
    { 
      name: 'HOME LISAS', 
      values: { 
        'Status do cliente': 'precisa_atencao' 
      } 
    },
  ]

  // Criar clientes do grupo Onboarding
  const onboardingGroup = getGroup('Onboarding')
  if (onboardingGroup && clientesOnboarding.length > 0) {
    // Limpar itens existentes do grupo Onboarding
    const { data: existingOnboardingItems } = await supabase
      .from('items')
      .select('id')
      .eq('group_id', onboardingGroup.id)

    if (existingOnboardingItems && existingOnboardingItems.length > 0) {
      for (const item of existingOnboardingItems) {
        await supabase.from('subitems').delete().eq('item_id', item.id)
        await supabase.from('column_values').delete().eq('item_id', item.id)
      }
      await supabase.from('items').delete().in('id', existingOnboardingItems.map(i => i.id))
    }

    // Criar clientes do grupo Onboarding
    for (let i = 0; i < clientesOnboarding.length; i++) {
      const cliente = clientesOnboarding[i]
      
      const { data: item } = await supabase
        .from('items')
        .insert({
          name: cliente.name,
          group_id: onboardingGroup.id,
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
  }

  // Função helper para criar clientes em um grupo
  const criarClientesNoGrupo = async (group: any, clientes: typeof clientesContas) => {
    if (!group) return

    // Limpar itens existentes
    const { data: existingItems } = await supabase
      .from('items')
      .select('id')
      .eq('group_id', group.id)

    if (existingItems && existingItems.length > 0) {
      for (const item of existingItems) {
        await supabase.from('subitems').delete().eq('item_id', item.id)
        await supabase.from('column_values').delete().eq('item_id', item.id)
      }
      await supabase.from('items').delete().in('id', existingItems.map(i => i.id))
    }

    // Criar TODOS os clientes
    for (let i = 0; i < clientes.length; i++) {
      const cliente = clientes[i]
      
      const { data: item } = await supabase
        .from('items')
        .insert({
          name: cliente.name,
          group_id: group.id,
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
  }

  // Criar clientes do grupo Contas
  const contasGroup = getGroup('Contas')
  if (contasGroup) {
    console.log(`Criando ${clientesContas.length} clientes no grupo Contas`)
    await criarClientesNoGrupo(contasGroup, clientesContas)
  }

  // Criar clientes do grupo Feedback Semanal (mesmos clientes do Contas)
  const feedbackSemanalGroup = getGroup('Feedback Semanal')
  if (feedbackSemanalGroup) {
    console.log(`Criando ${clientesContas.length} clientes no grupo Feedback Semanal`)
    await criarClientesNoGrupo(feedbackSemanalGroup, clientesContas)
  } else {
    console.error('Grupo Feedback Semanal não encontrado!')
  }

  // Criar clientes do grupo Feedback Mensal (mesmos clientes do Contas)
  const feedbackMensalGroup = getGroup('Feedback Mensal')
  if (feedbackMensalGroup) {
    console.log(`Criando ${clientesContas.length} clientes no grupo Feedback Mensal`)
    await criarClientesNoGrupo(feedbackMensalGroup, clientesContas)
  } else {
    console.error('Grupo Feedback Mensal não encontrado!')
  }

  return { success: true, boardId }
}
