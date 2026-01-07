import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ImportBriefing } from '@/types/briefing'

/**
 * POST /api/ai/create-from-briefing
 * Cria board e visualizações baseado no briefing confirmado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      workspaceId,
      briefing,
      excelData,
      boardName
    } = body

    if (!workspaceId || !briefing || !excelData) {
      return NextResponse.json(
        { error: 'workspaceId, briefing e excelData são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { getDefaultUserId } = await import('@/lib/utils')
    const defaultUserId = getDefaultUserId()

    // 1. Criar board
    const { data: boardData, error: boardError } = await supabase
      .from('boards')
      .insert([
        {
          name: boardName || `Quadro - ${briefing.dataType}`,
          description: briefing.summary.substring(0, 500),
          workspace_id: workspaceId,
          user_id: defaultUserId,
          type: 'board',
        },
      ])
      .select()
      .single()

    if (boardError || !boardData) {
      throw new Error(`Erro ao criar board: ${boardError?.message}`)
    }

    // 2. Criar colunas sugeridas pela IA
    const columnMap = new Map<string, string>()

    for (const suggestedCol of briefing.suggestedColumns) {
      const { data: colData, error: colError } = await supabase
        .from('columns')
        .insert({
          name: suggestedCol.name,
          board_id: boardData.id,
          type: suggestedCol.type,
          position: briefing.suggestedColumns.indexOf(suggestedCol),
        })
        .select()
        .single()

      if (!colError && colData) {
        columnMap.set(suggestedCol.name, colData.id)
      }
    }

    // 3. Processar dados e criar grupos/itens
    const headers = excelData.headers
    const rows = excelData.rows || []

    // Determinar estratégia de agrupamento
    let groups: Map<string, any[]> = new Map()

    if (briefing.grouping.strategy === 'by_column' && briefing.grouping.byColumn) {
      // Agrupar por coluna específica
      const groupColumnIndex = headers.findIndex(h => 
        h.toLowerCase() === briefing.grouping.byColumn?.toLowerCase()
      )

      if (groupColumnIndex >= 0) {
        rows.forEach((row: any[]) => {
          const groupName = String(row[groupColumnIndex] || briefing.grouping.defaultGroup || 'Sem grupo').trim()
          if (!groups.has(groupName)) {
            groups.set(groupName, [])
          }
          groups.get(groupName)!.push(row)
        })
      } else {
        // Fallback: grupo único
        groups.set(briefing.grouping.defaultGroup || 'Itens', rows)
      }
    } else {
      // Grupo único
      groups.set(briefing.grouping.defaultGroup || 'Itens', rows)
    }

    // 4. Criar grupos e itens
    let groupPosition = 0
    for (const [groupName, groupRows] of groups) {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: groupName,
          board_id: boardData.id,
          position: groupPosition++,
          is_collapsed: false,
        })
        .select()
        .single()

      if (groupError || !groupData) continue

      // Criar itens do grupo
      for (let itemIndex = 0; itemIndex < groupRows.length; itemIndex++) {
        const row = groupRows[itemIndex]

        // Determinar nome do item (primeira coluna que não é grupo)
        let itemName = ''
        if (briefing.grouping.strategy === 'by_column' && briefing.grouping.byColumn) {
          const groupColIndex = headers.findIndex(h => 
            h.toLowerCase() === briefing.grouping.byColumn?.toLowerCase()
          )
          // Nome do item é a próxima coluna após grupo
          itemName = String(row[groupColIndex + 1] || row[0] || `Item ${itemIndex + 1}`).trim()
        } else {
          itemName = String(row[0] || `Item ${itemIndex + 1}`).trim()
        }

        if (!itemName || itemName === '') {
          itemName = `Item ${itemIndex + 1}`
        }

        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .insert({
            name: itemName,
            group_id: groupData.id,
            position: itemIndex,
            user_id: defaultUserId,
          })
          .select()
          .single()

        if (itemError || !itemData) continue

        // Criar valores das colunas
        for (let colIndex = 0; colIndex < headers.length; colIndex++) {
          const headerName = headers[colIndex]
          const cellValue = row[colIndex]

          // Pular coluna de grupo se houver
          if (briefing.grouping.strategy === 'by_column' && 
              briefing.grouping.byColumn &&
              headerName.toLowerCase() === briefing.grouping.byColumn.toLowerCase()) {
            continue
          }

          const columnId = columnMap.get(headerName)
          if (!columnId || !cellValue) continue

          // Processar valor baseado no tipo da coluna
          let processedValue: any = cellValue

          const suggestedCol = briefing.suggestedColumns.find(sc => sc.name === headerName)
          if (suggestedCol?.type === 'number' || suggestedCol?.type === 'currency') {
            // Tentar converter para número
            const numValue = parseFloat(String(cellValue).replace(/[^\d.,]/g, '').replace(',', '.'))
            processedValue = isNaN(numValue) ? cellValue : numValue
          } else if (suggestedCol?.type === 'date') {
            // Manter como string, será processado depois
            processedValue = String(cellValue)
          }

          await supabase.from('column_values').insert({
            item_id: itemData.id,
            column_id: columnId,
            value: processedValue,
          })
        }
      }
    }

    // 5. Salvar configuração de visualizações no dashboard_configs (se necessário)
    if (briefing.visualizations && briefing.visualizations.length > 0) {
      await supabase
        .from('dashboard_configs')
        .upsert({
          workspace_id: workspaceId,
          user_id: null, // Config global do workspace
          widget_config: {
            visualizations: briefing.visualizations,
            boardId: boardData.id
          }
        }, {
          onConflict: 'workspace_id,user_id'
        })
    }

    return NextResponse.json({
      success: true,
      boardId: boardData.id,
      boardName: boardData.name,
      message: 'Board criado com sucesso baseado no briefing da IA'
    })

  } catch (error: any) {
    console.error('Erro ao criar board a partir do briefing:', error)
    return NextResponse.json(
      { error: 'Erro ao criar board', details: error.message },
      { status: 500 }
    )
  }
}

