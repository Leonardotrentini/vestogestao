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
      className={`flex-1 min-w-[280px] max-w-[320px] bg-gray-100 rounded-lg p-3 transition-colors ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-500' : ''
      }`}
    >
      {/* Header da Coluna */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 mb-1">{group.name}</h3>
        <span className="text-xs text-gray-500">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
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
          <form onSubmit={handleCreateItem} className="bg-white rounded-lg p-3 border border-blue-500">
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Nome do item"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowItemInput(false)
                  setItemName('')
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowItemInput(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            <span>Adicionar item</span>
          </button>
        )}
      </div>
    </div>
  )
}

