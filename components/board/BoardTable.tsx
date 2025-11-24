'use client'

import { Group, Item, Column } from '@/supabase/migrations/types'
import GroupSection from './GroupSection'

interface BoardTableProps {
  groups: Group[]
  items: Item[]
  columns: Column[]
  onToggleGroup: (groupId: string, isCollapsed: boolean) => void
  onCreateItem: (groupId: string, name: string) => void
  boardId: string
}

export default function BoardTable({
  groups,
  items,
  columns,
  onToggleGroup,
  onCreateItem,
  boardId,
}: BoardTableProps) {
  return (
    <div className="w-full">
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
  )
}
