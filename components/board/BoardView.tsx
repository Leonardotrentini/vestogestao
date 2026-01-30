'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Group, Item, Column } from '@/supabase/migrations/types'
import BoardTable from './BoardTable'
import BoardKanbanView from './BoardKanbanView'
import BoardHeader from './BoardHeader'
import DocumentEditor from './DocumentEditor'
import IntelligenceBoard from '@/components/analytics/IntelligenceBoard'
import PerformanceDashboard from '@/components/analytics/PerformanceDashboard'
import BoardVisualizations from './BoardVisualizations'
import { GroupSkeleton } from '@/components/common/Skeleton'

interface BoardViewProps {
  boardId: string
  workspaceId: string
  boardName?: string
  boardType?: 'board' | 'document' | 'intelligence' | 'dashboard'
  boardContent?: string
}

export default function BoardView({ boardId, workspaceId, boardName, boardType = 'board', boardContent = '' }: BoardViewProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [columnValues, setColumnValues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'charts'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadData()
    
    const groupsChannel = supabase
      .channel('groups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups', filter: `board_id=eq.${boardId}` }, () => {
        loadData()
      })
      .subscribe()

    const itemsChannel = supabase
      .channel('items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        loadData()
      })
      .subscribe()

    // Verificar prazos a cada 5 minutos
    const checkDeadlinesInterval = setInterval(async () => {
      try {
        const { checkDeadlines } = await import('@/lib/notifications')
        await checkDeadlines()
      } catch (error) {
        console.error('Erro ao verificar prazos:', error)
      }
    }, 5 * 60 * 1000) // 5 minutos

    // Verificar prazos imediatamente ao carregar
    const checkDeadlinesImmediate = async () => {
      try {
        const { checkDeadlines } = await import('@/lib/notifications')
        await checkDeadlines()
      } catch (error) {
        console.error('Erro ao verificar prazos:', error)
      }
    }
    checkDeadlinesImmediate()

    return () => {
      supabase.removeChannel(groupsChannel)
      supabase.removeChannel(itemsChannel)
      clearInterval(checkDeadlinesInterval)
    }
  }, [boardId])

  const loadData = async () => {
    const { data: groupsData } = await supabase
      .from('groups')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    const { data: itemsData } = await supabase
      .from('items')
      .select('*')
      .in('group_id', groupsData?.map(g => g.id) || [])
      .order('position', { ascending: true })

    const { data: columnsData } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    // Carregar valores das colunas
    const itemIds = itemsData?.map(i => i.id) || []
    const { data: columnValuesData } = await supabase
      .from('column_values')
      .select('*')
      .in('item_id', itemIds.length > 0 ? itemIds : ['00000000-0000-0000-0000-000000000000'])

    setGroups(groupsData || [])
    setItems(itemsData || [])
    setColumns(columnsData || [])
    setColumnValues(columnValuesData || [])
    setLoading(false)
  }

  const handleCreateGroup = async (name: string) => {
    try {
      const maxPosition = groups.length > 0 ? Math.max(...groups.map(g => g.position)) : 0

      const { error } = await supabase.from('groups').insert({
        name,
        board_id: boardId,
        position: maxPosition + 1,
      })

      if (error) throw error

      loadData()
    } catch (error) {
      console.error('Erro ao criar grupo:', error)
    }
  }

  const handleCreateItem = async (groupId: string, name: string) => {
    const maxPosition = items.filter(i => i.group_id === groupId).length

    await supabase.from('items').insert({
      name,
      group_id: groupId,
      position: maxPosition,
    })

    loadData()
  }

  const handleToggleGroup = async (groupId: string, isCollapsed: boolean) => {
    await supabase
      .from('groups')
      .update({ is_collapsed: !isCollapsed })
      .eq('id', groupId)

    loadData()
  }

  const handleMoveItem = async (itemId: string, targetGroupId: string) => {
    await supabase
      .from('items')
      .update({ group_id: targetGroupId })
      .eq('id', itemId)

    loadData()
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0F1711]">
        <BoardHeader 
          boardName={boardName} 
          onCreateGroup={handleCreateGroup}
          boardId={boardId}
          workspaceId={workspaceId}
          columns={columns}
          onColumnsChange={loadData}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isDocument={boardType === 'document'}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <div className="flex-1 overflow-auto p-6">
          <GroupSkeleton />
          <GroupSkeleton />
          <GroupSkeleton />
        </div>
      </div>
    )
  }

  // Se for documento, renderizar editor de texto
  if (boardType === 'document') {
    return (
      <div className="flex flex-col min-h-screen bg-[#0F1711]">
        <BoardHeader 
          boardName={boardName} 
          onCreateGroup={handleCreateGroup}
          boardId={boardId}
          workspaceId={workspaceId}
          columns={columns}
          onColumnsChange={loadData}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isDocument={true}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <DocumentEditor boardId={boardId} initialContent={boardContent} />
      </div>
    )
  }

  // Se for intelligence board, renderizar dashboard de analytics
  if (boardType === 'intelligence') {
    return (
      <div className="flex flex-col min-h-screen bg-[#0F1711]">
        <BoardHeader 
          boardName={boardName} 
          onCreateGroup={handleCreateGroup}
          boardId={boardId}
          workspaceId={workspaceId}
          columns={columns}
          onColumnsChange={loadData}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isDocument={true}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <IntelligenceBoard workspaceId={workspaceId} />
      </div>
    )
  }

  // Se for dashboard board, renderizar dashboard de performance
  if (boardType === 'dashboard') {
    // Extrair spreadsheetId do boardContent se existir
    let spreadsheetId: string | undefined
    try {
      if (boardContent) {
        const content = JSON.parse(boardContent)
        spreadsheetId = content.spreadsheetId
      }
    } catch {
      // Se não for JSON válido, ignora
    }

    return (
      <div className="flex flex-col min-h-screen">
        <PerformanceDashboard 
          boardId={boardId} 
          workspaceId={workspaceId}
          spreadsheetId={spreadsheetId}
        />
      </div>
    )
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  
  // Filtrar itens baseado no termo de pesquisa
  const filteredItems = normalizedSearch
    ? items.filter((item) => {
        const itemName = (item.name || '').toLowerCase()
        return itemName.includes(normalizedSearch)
      })
    : items

  // Filtrar e preparar grupos para mostrar apenas aqueles que têm itens correspondentes à pesquisa
  const filteredGroups = normalizedSearch
    ? groups
        .filter((group) => {
          // Verificar se algum item do grupo corresponde à pesquisa
          const groupItems = filteredItems.filter((item) => item.group_id === group.id)
          const groupNameMatches = group.name.toLowerCase().includes(normalizedSearch)
          return groupItems.length > 0 || groupNameMatches
        })
        .map((group) => ({
          ...group,
          // Expandir automaticamente grupos que têm resultados da busca
          is_collapsed: false,
        }))
    : groups

  return (
    <div className="flex flex-col min-h-screen bg-[#0F1711]">
      <BoardHeader 
        boardName={boardName} 
        onCreateGroup={handleCreateGroup}
        boardId={boardId}
        workspaceId={workspaceId}
        columns={columns}
        onColumnsChange={loadData}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      {normalizedSearch && filteredItems.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-[rgba(255,255,255,0.7)] text-base mb-1">
              Nenhum resultado encontrado para
            </p>
            <p className="text-[#C79D45] font-medium text-lg mb-4">"{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-[#C79D45] hover:text-[#D4AD5F] text-sm underline transition-colors px-4 py-2 hover:bg-[rgba(199,157,69,0.1)] rounded-lg"
            >
              Limpar busca
            </button>
          </div>
        </div>
      )}
      {(!normalizedSearch || filteredItems.length > 0) && (
        <div className="flex-1 overflow-auto">
          {viewMode === 'table' ? (
            <BoardTable
              groups={filteredGroups}
              items={filteredItems}
              columns={columns}
              onToggleGroup={handleToggleGroup}
              onCreateItem={handleCreateItem}
              onMoveItem={handleMoveItem}
              boardId={boardId}
            />
          ) : viewMode === 'charts' ? (
            <BoardVisualizations
              items={filteredItems}
              columns={columns}
              columnValues={columnValues}
            />
          ) : (
            <BoardKanbanView
              groups={filteredGroups}
              items={filteredItems}
              columns={columns}
              onCreateItem={handleCreateItem}
              boardId={boardId}
            />
          )}
        </div>
      )}
    </div>
  )
}
