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
  )
}
