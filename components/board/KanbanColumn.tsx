'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Group, Item, Column } from '@/supabase/migrations/types'
import { Plus } from 'lucide-react'
import KanbanCard from './KanbanCard'

interface KanbanColumnProps {
  group: Group
  items: Item[]
  columns: Column[]
  onCreateItem: (groupId: string, name: string) => void
  boardId: string
}

export default function KanbanColumn({ group, items, columns, onCreateItem, boardId }: KanbanColumnProps) {
  const [showItemInput, setShowItemInput] = useState(false)
  const [itemName, setItemName] = useState('')
  const { setNodeRef, isOver } = useDroppable({
    id: group.id,
  })

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (itemName.trim()) {
      onCreateItem(group.id, itemName.trim())
      setItemName('')
      setShowItemInput(false)
    }
  }

  const itemIds = items.map(item => item.id)

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] max-w-[320px] bg-secondary rounded-lg p-3 transition-colors ${
        isOver ? 'bg-accent ring-2 ring-primary' : ''
      }`}
    >
      {/* Header da Coluna */}
      <div className="mb-3">
        <h3 className="font-semibold text-foreground mb-1">{group.name}</h3>
        <span className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
      </div>

      {/* Lista de Itens */}
      <div className="space-y-2 min-h-[200px] max-h-[calc(100vh-250px)] overflow-y-auto">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              columns={columns}
              boardId={boardId}
              isDragging={false}
            />
          ))}
        </SortableContext>

        {/* Formulário de Criar Item */}
        {showItemInput ? (
          <form onSubmit={handleCreateItem} className="bg-background rounded-lg p-3 border border-primary">
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Nome do item"
              className="w-full px-2 py-1 border border-border bg-background text-foreground rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 transition-opacity"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowItemInput(false)
                  setItemName('')
                }}
                className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm hover:bg-accent"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowItemInput(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            <span>Adicionar item</span>
          </button>
        )}
      </div>
    </div>
  )
}

