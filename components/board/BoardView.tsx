'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Group, Item, Column } from '@/supabase/migrations/types'
import BoardTable from './BoardTable'
import BoardKanbanView from './BoardKanbanView'
import BoardHeader from './BoardHeader'

interface BoardViewProps {
  boardId: string
  workspaceId: string
  boardName?: string
}

export default function BoardView({ boardId, workspaceId, boardName }: BoardViewProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
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

    return () => {
      supabase.removeChannel(groupsChannel)
      supabase.removeChannel(itemsChannel)
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

  if (loading) {
    return <div className="p-8 text-gray-600">Carregando...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BoardHeader 
        boardName={boardName} 
        onCreateGroup={handleCreateGroup}
        boardId={boardId}
        workspaceId={workspaceId}
        columns={columns}
        onColumnsChange={loadData}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div className="flex-1">
        {viewMode === 'table' ? (
          <BoardTable
            groups={groups}
            items={items}
            columns={columns}
            onToggleGroup={handleToggleGroup}
            onCreateItem={handleCreateItem}
            boardId={boardId}
          />
        ) : (
          <BoardKanbanView
            groups={groups}
            items={items}
            columns={columns}
            onCreateItem={handleCreateItem}
            boardId={boardId}
          />
        )}
      </div>
    </div>
  )
}
