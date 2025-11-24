'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import { Group, Item, Column } from '@/supabase/migrations/types'
import { createClient } from '@/lib/supabase/client'
import ItemTableRow from '../item/ItemTableRow'

interface GroupSectionProps {
  group: Group
  items: Item[]
  columns: Column[]
  onToggle: (groupId: string, isCollapsed: boolean) => void
  onCreateItem: (groupId: string, name: string) => void
  boardId: string
}

export default function GroupSection({
  group,
  items,
  columns,
  onToggle,
  onCreateItem,
  boardId,
}: GroupSectionProps) {
  const [showItemInput, setShowItemInput] = useState(false)
  const [itemName, setItemName] = useState('')
  const [isEditingGroupName, setIsEditingGroupName] = useState(false)
  const [groupName, setGroupName] = useState(group.name)
  const supabase = createClient()

  useEffect(() => {
    setGroupName(group.name)
  }, [group.name])

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (itemName.trim()) {
      onCreateItem(group.id, itemName.trim())
      setItemName('')
      setShowItemInput(false)
    }
  }

  const handleGroupNameUpdate = async () => {
    if (groupName.trim() && groupName !== group.name) {
      await supabase
        .from('groups')
        .update({ name: groupName.trim() })
        .eq('id', group.id)
    } else {
      setGroupName(group.name)
    }
    setIsEditingGroupName(false)
  }

  const handleDeleteGroup = async () => {
    if (confirm(`Tem certeza que deseja deletar o grupo "${group.name}"? Todos os itens dentro dele serão removidos.`)) {
      await supabase
        .from('groups')
        .delete()
        .eq('id', group.id)
    }
  }

  return (
    <div id={`group-${group.id}`} className="border-b border-gray-200">
      {/* Header do Grupo */}
      <div className="flex items-center bg-gray-50 border-b border-gray-200 px-4 py-2 hover:bg-gray-100 group/header">
        <div 
          className="flex items-center gap-2 flex-shrink-0 w-64 cursor-pointer"
          onClick={() => onToggle(group.id, group.is_collapsed)}
          onDoubleClick={(e) => {
            e.stopPropagation()
            setIsEditingGroupName(true)
          }}
        >
          {group.is_collapsed ? (
            <ChevronRight className="text-gray-500" size={16} />
          ) : (
            <ChevronDown className="text-gray-500" size={16} />
          )}
          {isEditingGroupName ? (
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onBlur={handleGroupNameUpdate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGroupNameUpdate()
                } else if (e.key === 'Escape') {
                  setGroupName(group.name)
                  setIsEditingGroupName(false)
                }
              }}
              className="px-2 py-0.5 border border-blue-400 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm font-medium text-gray-900">{group.name}</span>
          )}
        </div>
        <div className="flex-1" />
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteGroup()
          }}
          className="opacity-0 group-hover/header:opacity-100 p-1 hover:bg-red-100 rounded text-red-600 transition-opacity"
          title="Deletar grupo"
        >
          <X size={16} />
        </button>
      </div>

      {!group.is_collapsed && (
        <div className="bg-white">
          {/* Header das Colunas */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
            <div className="flex">
              <div className="w-8 px-2 py-2 border-r border-gray-200"></div>
              <div className="w-64 min-w-[256px] px-3 py-2 border-r border-gray-200 bg-gray-50">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Elemento</span>
              </div>
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="w-40 min-w-[160px] px-3 py-2 border-r border-gray-200 bg-gray-50"
                >
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{column.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div>
            {items.length === 0 && !showItemInput && (
              <div className="flex border-b border-gray-100">
                <div className="w-8 px-2 py-3 border-r border-gray-200"></div>
                <div className="w-64 min-w-[256px] px-3 py-3 border-r border-gray-200 text-sm text-gray-400">
                  Nenhum elemento
                </div>
                {columns.map((column) => (
                  <div key={column.id} className="w-40 min-w-[160px] px-3 py-3 border-r border-gray-200"></div>
                ))}
              </div>
            )}

            {items.map((item) => (
              <ItemTableRow
                key={item.id}
                item={item}
                columns={columns}
                boardId={boardId}
              />
            ))}

            {/* Criar novo item */}
            {showItemInput ? (
              <form onSubmit={handleCreateItem} className="flex border-b border-gray-100">
                <div className="w-8 px-2 py-2 border-r border-gray-200"></div>
                <div className="w-64 min-w-[256px] px-3 py-2 border-r border-gray-200">
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Nome do elemento"
                    className="w-full px-2 py-1 border border-blue-400 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className="w-40 min-w-[160px] px-3 py-2 border-r border-gray-200"
                  />
                ))}
                <div className="px-3 py-2 flex gap-2 items-center">
                  <button
                    type="submit"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemInput(false)
                      setItemName('')
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowItemInput(true)}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-sm border-b border-gray-100 transition-colors"
              >
                <div className="w-8"></div>
                <Plus size={14} />
                <span>Adicionar elemento</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

