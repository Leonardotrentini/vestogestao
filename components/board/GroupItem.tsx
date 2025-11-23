'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { Group, Item, Column } from '@/types'
import ItemRow from '../item/ItemRow'

interface GroupItemProps {
  group: Group
  items: Item[]
  columns: Column[]
  onToggle: (groupId: string, isCollapsed: boolean) => void
  onCreateItem: (groupId: string, name: string) => void
  boardId: string
}

export default function GroupItem({
  group,
  items,
  columns,
  onToggle,
  onCreateItem,
  boardId,
}: GroupItemProps) {
  const [showItemInput, setShowItemInput] = useState(false)
  const [itemName, setItemName] = useState('')

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (itemName.trim()) {
      onCreateItem(group.id, itemName.trim())
      setItemName('')
      setShowItemInput(false)
    }
  }

  const getGroupColor = () => {
    // Cores diferentes para diferentes grupos
    const colors = [
      'bg-green-50 border-green-200',
      'bg-orange-50 border-orange-200',
      'bg-blue-50 border-blue-200',
      'bg-purple-50 border-purple-200',
    ]
    return colors[group.position % colors.length]
  }

  return (
    <div className={`mb-4 rounded-lg border ${getGroupColor()}`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-opacity-80"
        onClick={() => onToggle(group.id, group.is_collapsed)}
      >
        <div className="flex items-center gap-2">
          {group.is_collapsed ? (
            <ChevronRight className="text-gray-600" size={20} />
          ) : (
            <ChevronDown className="text-gray-600" size={20} />
          )}
          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
          <span className="text-sm text-gray-500">({items.length})</span>
        </div>
      </div>

      {!group.is_collapsed && (
        <div className="bg-white border-t border-gray-200">
          {/* Header das colunas */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-64 p-3 font-medium text-sm text-gray-700 border-r border-gray-200">
              Elemento
            </div>
            {columns.map((column) => (
              <div
                key={column.id}
                className="w-40 p-3 font-medium text-sm text-gray-700 border-r border-gray-200"
              >
                {column.name}
              </div>
            ))}
          </div>

          {/* Items */}
          <div>
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                columns={columns}
                boardId={boardId}
              />
            ))}

            {/* Criar novo item */}
            {showItemInput ? (
              <form onSubmit={handleCreateItem} className="flex border-b border-gray-200">
                <div className="w-64 p-3 border-r border-gray-200">
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Nome do item"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className="w-40 p-3 border-r border-gray-200"
                  />
                ))}
                <div className="p-3 flex gap-2">
                  <button
                    type="submit"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemInput(false)
                      setItemName('')
                    }}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowItemInput(true)}
                className="w-full flex items-center gap-2 p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm border-b border-gray-200"
              >
                <Plus size={16} />
                Adicionar elemento
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

