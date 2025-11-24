// Script para criar os 4 quadros do Monday.com com TODOS os dados dos prints
import { createClient } from '@/lib/supabase/client'
import { getDefaultUserId } from '@/lib/utils'

export async function seedBoards(workspaceId: string) {
  const supabase = createClient()
  const defaultUserId = getDefaultUserId()

  // ==================== QUADRO 1: Web Designer - Clientes ====================
  const board1 = await createBoard(supabase, workspaceId, defaultUserId, {
    name: 'Web Designer - Clientes',
    description: 'Quadro de gerenciamento de projetos de web design',
    columns: [
      { name: 'Pessoa', type: 'person', position: 1 },
      { name: 'Status', type: 'status', position: 2 },
      { name: 'Prioridade', type: 'priority', position: 3 },
      { name: 'Inicio-Finalização', type: 'date', position: 4 },
      { name: 'Controle de tempo', type: 'time_tracking', position: 5 },
    ],
    groups: [
      {
        name: 'Produção de Copywriter',
        items: [
          {
            name: 'Mundo feliz fantasia',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'aguardo',
              'Prioridade': 'baixa',
              'Controle de tempo': 971, // 16m 11s
            },
          },
        ],
      },
      {
        name: 'Desenvolvimento de Layout',
        items: [
          {
            name: 'Estudo LP VENDAS 1',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'a_iniciar',
              'Prioridade': 'media',
              'Inicio-Finalização': {
                start: new Date(2024, 9, 14).toISOString(),
                end: new Date(2024, 9, 18).toISOString(),
              },
            },
          },
        ],
      },
      {
        name: 'Implementação',
        items: [
          {
            name: 'REFAZER LP CLUBE',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'em_progresso',
              'Prioridade': 'alta',
              'Inicio-Finalização': {
                start: new Date(2024, 10, 19).toISOString(),
                end: new Date(2024, 10, 24).toISOString(),
              },
              'Controle de tempo': 34319, // 9h 31m 59s
            },
          },
        ],
      },
      {
        name: 'Projetos "Travados"',
        items: [
          {
            name: 'Catalogo mundo feliz',
            values: {
              'Status': 'aguardando_aprovacao',
              'Prioridade': 'baixa',
              'Controle de tempo': 5828, // 1h 37m 8s
            },
          },
          {
            name: 'OMG TEXTIL',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'aguardo',
              'Prioridade': 'baixa',
              'Inicio-Finalização': {
                start: new Date(2024, 10, 6).toISOString(),
                end: new Date(2024, 10, 12).toISOString(),
              },
              'Controle de tempo': 22474, // 6h 14m 34s
            },
          },
          {
            name: 'Lets Go Surf Grife',
            values: {
              'Status': 'aguardo',
              'Prioridade': 'cliente',
            },
          },
          {
            name: 'Fenix Atacado',
            values: {
              'Status': 'aguardo',
              'Prioridade': 'cliente',
            },
          },
          {
            name: 'BlueJeans',
            values: {
              'Status': 'aguardo',
              'Prioridade': 'cliente',
            },
          },
          {
            name: 'Intimithus',
            values: {
              'Status': 'aguardo',
              'Prioridade': 'cliente',
            },
          },
          {
            name: 'Parlez Vous',
            values: {
              'Status': 'aguardo',
              'Prioridade': 'cliente',
            },
          },
          {
            name: 'All Men Trendy',
            values: {
              'Status': 'aguardo',
              'Prioridade': 'cliente',
            },
          },
        ],
      },
      {
        name: 'Projetos finalizados',
        items: [
          {
            name: 'Use Lily',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'finalizado',
              'Prioridade': 'cliente',
              'Inicio-Finalização': {
                start: new Date(2024, 8, 10).toISOString(),
                end: new Date(2024, 8, 17).toISOString(),
              },
              'Controle de tempo': 11541, // 3h 12m 21s
            },
          },
          {
            name: 'Supremo Atacado',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'finalizado',
              'Prioridade': 'cliente',
            },
          },
          {
            name: 'DINO GRIFES',
            values: {
              'Status': 'finalizado',
              'Prioridade': 'baixa',
              'Inicio-Finalização': {
                start: new Date(2024, 7, 12).toISOString(),
                end: new Date(2024, 7, 18).toISOString(),
              },
            },
          },
          {
            name: 'Dimirim - babara',
            values: {
              'Status': 'finalizado',
              'Prioridade': 'cliente',
            },
          },
          {
            name: 'Bauer Store',
            values: {
              'Status': 'finalizado',
              'Prioridade': 'cliente',
            },
          },
          {
            name: 'RosaUrbana',
            values: {
              'Status': 'finalizado',
              'Prioridade': 'cliente',
            },
          },
          {
            name: 'Lx Atacado',
            values: {
              'Status': 'finalizado',
              'Prioridade': 'cliente',
            },
          },
          {
            name: 'Mk - modas',
            values: {
              'Status': 'finalizado',
              'Prioridade': 'cliente',
            },
          },
          {
            name: 'BlackShop Atacado',
            values: {
              'Status': 'finalizado',
              'Prioridade': 'cliente',
            },
          },
        ],
      },
    ],
  })

  // ==================== QUADRO 2: Gestão de Clientes ====================
  const board2 = await createBoard(supabase, workspaceId, defaultUserId, {
    name: 'Gestão de Clientes',
    description: 'Sistema completo de gestão de clientes',
    columns: [
      { name: 'Responsável', type: 'person', position: 1 },
      { name: 'Status do cliente', type: 'status', position: 2 },
      { name: 'Nicho', type: 'text', position: 3 },
      { name: 'Verba Mensal', type: 'currency', position: 4 },
      { name: 'Time de vendas', type: 'text', position: 5 },
      { name: 'Região', type: 'text', position: 6 },
      { name: 'Iniciou', type: 'date', position: 7 },
      { name: 'Drive de Criativos', type: 'link', position: 8 },
      { name: 'Raio X', type: 'link', position: 9 },
    ],
    groups: [
      {
        name: 'Onboarding',
        items: [],
      },
      {
        name: 'Contas',
        items: [
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
              'Raio X': 'https://drive.google.com/drive/raiox/sharp',
            },
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
              'Raio X': 'https://drive.google.com/drive/raiox/sierra',
            },
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
              'Raio X': 'https://drive.google.com/drive/raiox/vest',
            },
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
              'Raio X': 'https://drive.google.com/drive/raiox/eradino',
            },
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
              'Raio X': 'https://drive.google.com/drive/raiox/blushop',
            },
          },
        ],
      },
    ],
  })

  // ==================== QUADRO 3: Conteúdo ====================
  const board3 = await createBoard(supabase, workspaceId, defaultUserId, {
    name: 'Conteúdo',
    description: 'Gestão de produção de conteúdo para redes sociais',
    columns: [
      { name: 'Pessoa', type: 'person', position: 1 },
      { name: 'Status', type: 'status', position: 2 },
      { name: 'Cronograma', type: 'date', position: 3 },
      { name: 'Controle de tempo', type: 'time_tracking', position: 4 },
    ],
    groups: [
      {
        name: 'CALENDÁRIO DE POSTAGENS',
        items: [
          {
            name: 'SEGUNDA-FEIRA -> BrandsDecoded',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'planejamento',
            },
          },
          {
            name: 'TERÇA-FEIRA -> Twitter',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'planejamento',
            },
          },
          {
            name: 'QUARTA-FEIRA -> G4',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'planejamento',
            },
          },
          {
            name: 'QUINTA-FEIRA -> Case de Sucesso',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'planejamento',
            },
          },
          {
            name: 'SEXTA-FEIRA -> Teste de estrutura',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'planejamento',
            },
          },
        ],
      },
      {
        name: 'EDIÇÃO ANÚNCIOS',
        items: [
          {
            name: 'VSL - COMUNIDADE',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'upado_drive',
            },
          },
          {
            name: 'Isca CRM - model',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'upado_drive',
            },
          },
        ],
      },
      {
        name: 'Carrossel',
        items: [
          {
            name: 'Modelo de CASE DE SUCESSO',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'planejamento',
              'Cronograma': { start: new Date(2024, 8, 2).toISOString() },
            },
          },
          {
            name: 'Definir calendário de postagem de um mês',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'em_progresso',
              'Cronograma': {
                start: new Date(2024, 8, 8).toISOString(),
                end: new Date(2024, 8, 9).toISOString(),
              },
            },
          },
          {
            name: 'O paradoxo da Shein: como margens apertadas con...',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'planejamento',
            },
          },
          {
            name: 'O efeito omnichannel: como a Renner integrou onli...',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'planejamento',
            },
          },
          {
            name: 'A estratégia do TikTok: como microvideos criam col...',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'planejamento',
            },
          },
          {
            name: 'Virginia WePink - modelo brands',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'upado_drive',
              'Controle de tempo': 5021, // 1h 23m 41s
            },
          },
          {
            name: 'black friday - modelo twitter',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'upado_drive',
            },
          },
        ],
      },
      {
        name: 'Reels',
        items: [
          {
            name: 'Raul - Case WK + Anuncios',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'parado',
            },
          },
          {
            name: 'Cortes - WEBINAR black friday',
            values: {
              'Pessoa': defaultUserId,
              'Status': 'planejamento',
            },
          },
        ],
      },
    ],
  })

  // ==================== QUADRO 4: Comercial 2025 ====================
  const board4 = await createBoard(supabase, workspaceId, defaultUserId, {
    name: 'Comercial 2025',
    description: 'Sistema de gestão comercial e vendas',
    columns: [
      { name: 'Responsável', type: 'person', position: 1 },
      { name: 'Tentativas', type: 'text', position: 2 },
      { name: 'Status', type: 'status', position: 3 },
      { name: 'NEGOCIAÇÃO', type: 'currency', position: 4 },
      { name: 'Maturidade', type: 'text', position: 5 },
      { name: 'Dor', type: 'long_text', position: 6 },
      { name: 'Mercado', type: 'status', position: 7 },
      { name: 'Nicho', type: 'status', position: 8 },
      { name: 'Fonte', type: 'status', position: 9 },
      { name: 'Data reunião', type: 'date', position: 10 },
      { name: 'FEEDBACK DA CALL', type: 'long_text', position: 11 },
      { name: 'Motivo de Perda', type: 'long_text', position: 12 },
    ],
    groups: [
      {
        name: 'Apresentação Realizada',
        items: [
          {
            name: 'Cliente Teste - Frio 1',
            values: {
              'Status': 'frio',
              'NEGOCIAÇÃO': 'R$ 1.397',
              'Fonte': 'anuncios',
            },
          },
          {
            name: 'Cliente Teste - Agendado 1',
            values: {
              'Responsável': defaultUserId,
              'Status': 'agendado',
              'Tentativas': 'WhatsApp 1',
              'Dor': 'Não conseguia visualizar resultados',
              'Fonte': 'social_selling',
            },
          },
          {
            name: 'Cliente Teste - Negociando 1',
            values: {
              'Responsável': defaultUserId,
              'Status': 'negociando',
              'NEGOCIAÇÃO': 'R$ 997',
              'Maturidade': 'Escalando',
              'Dor': 'Não conseguia visualizar resultados',
              'Mercado': 'atacado',
              'Nicho': 'moda_feminina',
              'Fonte': 'anuncios',
              'FEEDBACK DA CALL': 'Cliente interessado, aguardando proposta',
            },
          },
        ],
      },
      {
        name: 'PERDIDO',
        items: [
          {
            name: 'Cliente Teste - Perdido 1',
            values: {
              'Status': 'fim_cadencia',
              'Tentativas': 'WhatsApp 1',
              'NEGOCIAÇÃO': 'R$ 0',
              'Nicho': 'jeans',
              'Fonte': 'indicacao',
              'Motivo de Perda': 'Fim de cadência',
            },
          },
        ],
      },
    ],
  })

  return { success: true }
}

async function createBoard(
  supabase: any,
  workspaceId: string,
  userId: string,
  data: {
    name: string
    description: string
    columns: { name: string; type: string; position: number }[]
    groups: {
      name: string
      items: {
        name: string
        values: Record<string, any>
      }[]
    }[]
  }
) {
  // Criar board
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .insert({
      name: data.name,
      description: data.description,
      workspace_id: workspaceId,
      user_id: userId,
    })
    .select()
    .single()

  if (boardError || !board) {
    console.error(`Error creating board ${data.name}:`, boardError)
    return null
  }

  // Criar colunas
  for (const col of data.columns) {
    await supabase.from('columns').insert({
      name: col.name,
      board_id: board.id,
      type: col.type,
      position: col.position,
    })
  }

  // Buscar colunas criadas
  const { data: columns } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', board.id)
    .order('position', { ascending: true })

  if (!columns) return board

  // Criar grupos e itens
  for (let groupIndex = 0; groupIndex < data.groups.length; groupIndex++) {
    const groupData = data.groups[groupIndex]
    
    const { data: group } = await supabase
      .from('groups')
      .insert({
        name: groupData.name,
        board_id: board.id,
        position: groupIndex,
      })
      .select()
      .single()

    if (!group) continue

    // Criar itens do grupo
    for (let itemIndex = 0; itemIndex < groupData.items.length; itemIndex++) {
      const itemData = groupData.items[itemIndex]
      
      const { data: item } = await supabase
        .from('items')
        .insert({
          name: itemData.name,
          group_id: group.id,
          position: itemIndex,
          user_id: itemData.values['Pessoa'] || itemData.values['Responsável'] || userId,
        })
        .select()
        .single()

      if (!item) continue

      // Criar valores das colunas
      for (const [colName, value] of Object.entries(itemData.values)) {
        // Ignorar campos que não são colunas (Pessoa/Responsável já estão no user_id do item)
        if (colName === 'Pessoa' || colName === 'Responsável') {
          continue
        }

        const column = columns.find((c: any) => c.name === colName)
        if (!column) {
          console.warn(`Column "${colName}" not found for item "${itemData.name}"`)
          continue
        }

        // Para time tracking, criar registro na tabela
        if (column.type === 'time_tracking' && typeof value === 'number') {
          await supabase.from('time_tracking').insert({
            item_id: item.id,
            user_id: userId,
            start_time: new Date(Date.now() - value * 1000).toISOString(),
            end_time: new Date().toISOString(),
            duration_seconds: value,
          })
        } else if (value !== null && value !== undefined) {
          // Para outros tipos, criar valor na tabela column_values
          await supabase.from('column_values').insert({
            item_id: item.id,
            column_id: column.id,
            value: value,
          })
        }
      }
    }
  }

  return board
}
