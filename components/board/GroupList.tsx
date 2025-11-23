'use client'

import { Group, Item, Column } from '@/types'
import GroupItem from './GroupItem'

interface GroupListProps {
  groups: Group[]
  items: Item[]
  columns: Column[]
  onToggleGroup: (groupId: string, isCollapsed: boolean) => void
  onCreateItem: (groupId: string, name: string) => void
  boardId: string
}

export default function GroupList({
  groups,
  items,
  columns,
  onToggleGroup,
  onCreateItem,
  boardId,
}: GroupListProps) {
  return (
    <div className="p-6">
      {groups.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhum grupo criado ainda. Clique em "Criar grupo" para começar.</p>
        </div>
      )}
      
      {groups.map((group) => (
        <GroupItem
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

