'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Group, Item, Column } from '@/supabase/migrations/types'
import { createClient } from '@/lib/supabase/client'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'

interface BoardKanbanViewProps {
  groups: Group[]
  items: Item[]
  columns: Column[]
  onCreateItem: (groupId: string, name: string) => void
  boardId: string
}

export default function BoardKanbanView({ groups, items, columns, onCreateItem, boardId }: BoardKanbanViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localItems, setLocalItems] = useState<Item[]>(items)
  const supabase = createClient()

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const itemId = active.id as string
    const targetId = over.id as string

    // Verificar se está arrastando para uma coluna (grupo)
    const targetGroup = groups.find(g => g.id === targetId)
    
    if (targetGroup) {
      // Arrastando diretamente para uma coluna
      const currentItem = localItems.find(i => i.id === itemId)
      if (!currentItem || currentItem.group_id === targetGroup.id) return

      // Mover item para a nova coluna
      await supabase
        .from('items')
        .update({ group_id: targetGroup.id })
        .eq('id', itemId)

      // Atualizar estado local
      setLocalItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, group_id: targetGroup.id } : item
      ))
    } else {
      // Pode estar arrastando sobre outro item, pegar o grupo dele
      const targetItem = localItems.find(i => i.id === targetId)
      if (targetItem) {
        const currentItem = localItems.find(i => i.id === itemId)
        if (!currentItem || currentItem.group_id === targetItem.group_id) return
        
        const targetGroupId = targetItem.group_id
        
        // Mover o item para o novo grupo
        await supabase
          .from('items')
          .update({ group_id: targetGroupId })
          .eq('id', itemId)

        // Atualizar estado local
        setLocalItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, group_id: targetGroupId } : item
        ))
      }
    }
  }

  const activeItem = activeId ? localItems.find(item => item.id === activeId) : null

  return (
    <div className="flex-1 bg-gray-50 p-4 overflow-x-auto">
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full min-w-max">
          {groups.map((group) => {
            const groupItems = localItems.filter(item => item.group_id === group.id)
            return (
              <KanbanColumn
                key={group.id}
                group={group}
                items={groupItems}
                columns={columns}
                onCreateItem={onCreateItem}
                boardId={boardId}
              />
            )
          })}
        </div>

        <DragOverlay>
          {activeItem ? (
            <KanbanCard
              item={activeItem}
              columns={columns}
              boardId={boardId}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

