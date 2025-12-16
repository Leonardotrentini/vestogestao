'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core'
import { Group, Item, Column } from '@/supabase/migrations/types'
import GroupSection from './GroupSection'
import ItemTableRow from '../item/ItemTableRow'

interface BoardTableProps {
  groups: Group[]
  items: Item[]
  columns: Column[]
  onToggleGroup: (groupId: string, isCollapsed: boolean) => void
  onCreateItem: (groupId: string, name: string) => void
  onMoveItem?: (itemId: string, targetGroupId: string) => void
  boardId: string
}

export default function BoardTable({
  groups,
  items,
  columns,
  onToggleGroup,
  onCreateItem,
  onMoveItem,
  boardId,
}: BoardTableProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || !onMoveItem) return

    const itemId = active.id as string
    const targetGroupId = over.id as string

    // Verificar se o target é um grupo
    const targetGroup = groups.find(g => g.id === targetGroupId)
    if (targetGroup) {
      // Verificar se o item já está neste grupo
      const currentItem = items.find(i => i.id === itemId)
      if (currentItem && currentItem.group_id !== targetGroupId) {
        onMoveItem(itemId, targetGroupId)
      }
    }
  }

  const activeItem = activeId ? items.find(item => item.id === activeId) : null

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-full overflow-x-auto overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(199,157,69,0.3) rgba(26,42,29,0.5)' }}>
        <div className="min-w-max">
          {groups.map((group) => (
            <GroupSection
              key={group.id}
              group={group}
              items={items.filter((item) => item.group_id === group.id)}
              columns={columns}
              onToggle={onToggleGroup}
              onCreateItem={onCreateItem}
              boardId={boardId}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="flex min-w-max border-b border-[rgba(199,157,69,0.2)] bg-[rgba(199,157,69,0.2)] opacity-50">
            <div className="w-8 flex-shrink-0 px-2 py-2 border-r border-[rgba(199,157,69,0.2)]"></div>
            <div className="w-64 flex-shrink-0 px-3 py-2 border-r border-[rgba(199,157,69,0.2)]">
              <span className="text-sm text-[rgba(255,255,255,0.95)]">{activeItem.name}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
