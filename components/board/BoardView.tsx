'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Group, Item, Column } from '@/supabase/migrations/types'
import BoardTable from './BoardTable'
import BoardKanbanView from './BoardKanbanView'
import BoardHeader from './BoardHeader'
import DocumentEditor from './DocumentEditor'

interface BoardViewProps {
  boardId: string
  workspaceId: string
  boardName?: string
  boardType?: 'board' | 'document'
  boardContent?: string
}

export default function BoardView({ boardId, workspaceId, boardName, boardType = 'board', boardContent = '' }: BoardViewProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
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

    setGroups(groupsData || [])
    setItems(itemsData || [])
    setColumns(columnsData || [])
    setLoading(false)
  }

  const handleCreateGroup = async (name: string) => {
    const maxPosition = groups.length > 0 ? Math.max(...groups.map(g => g.position)) : 0

    await supabase.from('groups').insert({
      name,
      board_id: boardId,
      position: maxPosition + 1,
    })

    loadData()
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
    return <div className="p-8 text-[rgba(255,255,255,0.7)]">Carregando...</div>
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
          <div className="text-center">
            <p className="text-[rgba(255,255,255,0.7)] mb-2">
              Nenhum resultado encontrado para <span className="text-[#C79D45] font-medium">"{searchTerm}"</span>
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-[#C79D45] hover:text-[#D4AD5F] text-sm underline"
            >
              Limpar busca
            </button>
          </div>
        </div>
      )}
      {(!normalizedSearch || filteredItems.length > 0) && (
        <div className="flex-1 overflow-hidden">
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
