'use client'

import { useState, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronRight, Plus, X, GripVertical } from 'lucide-react'
import { Group, Item, Column } from '@/supabase/migrations/types'
import { createClient } from '@/lib/supabase/client'
import ItemTableRow from '../item/ItemTableRow'
import ResizableColumnHeader from './ResizableColumnHeader'
import { getColumnWidth } from '@/lib/column-utils'

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
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const supabase = createClient()

  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
  })

  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: group.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Combinar refs (sortable e droppable)
  const combinedRef = (node: HTMLDivElement | null) => {
    setSortableNodeRef(node)
    setDroppableNodeRef(node)
  }

  // Inicializar larguras das colunas
  useEffect(() => {
    const widths: Record<string, number> = {}
    columns.forEach(column => {
      widths[column.id] = getColumnWidth(column)
    })
    setColumnWidths(widths)
  }, [columns])

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
      <div id={`group-${group.id}`} className="mb-4" style={style}>
        {/* Header do Grupo */}
        <div
          ref={combinedRef}
          className={`flex items-center bg-gradient-to-r from-[#1A2A1D] to-[#1f3322] border border-[rgba(199,157,69,0.3)] rounded-t-lg px-5 py-3.5 hover:bg-gradient-to-r hover:from-[rgba(199,157,69,0.15)] hover:to-[rgba(199,157,69,0.1)] hover:border-[rgba(199,157,69,0.5)] group/header transition-all duration-200 shadow-lg ${isOver ? 'bg-gradient-to-r from-[rgba(199,157,69,0.25)] to-[rgba(199,157,69,0.15)] border-[rgba(199,157,69,0.6)] shadow-xl' : ''} ${isDragging ? 'opacity-50' : ''}`}
        >
          {/* Handle de arrastar */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center cursor-grab active:cursor-grabbing mr-2 text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.8)] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={16} />
          </div>
          <div
            className="flex items-center gap-2 flex-shrink-0 flex-1 cursor-pointer"
            onClick={() => onToggle(group.id, group.is_collapsed)}
            onDoubleClick={(e) => {
              e.stopPropagation()
              setIsEditingGroupName(true)
            }}
          >
          {group.is_collapsed ? (
            <ChevronRight className="text-[rgba(255,255,255,0.7)]" size={16} />
          ) : (
            <ChevronDown className="text-[rgba(255,255,255,0.7)]" size={16} />
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
              className="px-2 py-0.5 border rounded text-sm font-medium focus:outline-none focus:ring-1"
              style={{ 
                borderColor: '#C79D45',
                backgroundColor: 'rgba(26, 42, 29, 0.7)',
                color: 'rgba(255, 255, 255, 0.95)',
                '--tw-ring-color': '#C79D45'
              } as React.CSSProperties}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-base font-semibold text-[rgba(255,255,255,0.95)]">{group.name}</span>
          )}
        </div>
        <div className="flex-1" />
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteGroup()
          }}
          className="opacity-0 group-hover/header:opacity-100 p-1 hover:bg-destructive/20 rounded text-destructive transition-opacity"
          title="Deletar grupo"
        >
          <X size={16} />
        </button>
      </div>

      {!group.is_collapsed && (
        <div className="bg-[#0F1711] rounded-b-lg border-x border-b border-[rgba(199,157,69,0.3)] shadow-lg overflow-hidden">
          {/* Header das Colunas */}
          <div className="sticky top-0 z-20 bg-gradient-to-b from-[#1A2A1D] to-[#152018] border-b-2 border-[rgba(199,157,69,0.4)] shadow-md">
            <div className="flex min-w-max">
              <div className="w-10 flex-shrink-0 px-3 py-3 border-r border-[rgba(199,157,69,0.2)]"></div>
              <div className="w-72 flex-shrink-0 px-4 py-3.5 border-r border-[rgba(199,157,69,0.2)] bg-gradient-to-r from-[#1A2A1D] to-[#1f3322]">
                <span className="text-xs font-bold text-[rgba(255,255,255,0.9)] uppercase tracking-wider">Elemento</span>
              </div>
              {columns.map((column) => {
                const width = columnWidths[column.id] || getColumnWidth(column)
                return (
                  <ResizableColumnHeader
                    key={column.id}
                    column={column}
                    defaultWidth={160}
                    currentWidth={width}
                    onResize={(columnId, newWidth) => {
                      // Atualizar estado local imediatamente para feedback visual
                      setColumnWidths(prev => ({
                        ...prev,
                        [columnId]: newWidth
                      }))
                    }}
                    onColumnNameChange={() => {
                      // Recarregar dados para atualizar o nome
                      window.location.reload()
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* Items */}
          <div>
            {items.length === 0 && !showItemInput && (
              <div className="flex min-w-max border-b border-[rgba(199,157,69,0.15)] hover:bg-[rgba(199,157,69,0.05)] transition-colors">
                <div className="w-10 flex-shrink-0 px-3 py-4 border-r border-[rgba(199,157,69,0.15)]"></div>
                <div className="w-72 flex-shrink-0 px-4 py-4 border-r border-[rgba(199,157,69,0.15)] text-sm text-[rgba(255,255,255,0.6)] italic">
                  Nenhum elemento
                </div>
                {columns.map((column) => {
                  const width = columnWidths[column.id] || getColumnWidth(column)
                  return (
                    <div 
                      key={column.id} 
                      className="flex-shrink-0 px-4 py-4 border-r border-[rgba(199,157,69,0.15)]"
                      style={{ width: `${width}px`, minWidth: '100px' }}
                    ></div>
                  )
                })}
              </div>
            )}

            {items.map((item) => (
              <ItemTableRow
                key={item.id}
                item={item}
                columns={columns}
                boardId={boardId}
                columnWidths={columnWidths}
              />
            ))}

            {/* Criar novo item */}
            {showItemInput ? (
              <form onSubmit={handleCreateItem} className="flex min-w-max border-b border-[rgba(199,157,69,0.15)] bg-[rgba(199,157,69,0.05)]">
                <div className="w-10 flex-shrink-0 px-3 py-3 border-r border-[rgba(199,157,69,0.15)]"></div>
                <div className="w-72 flex-shrink-0 px-4 py-3 border-r border-[rgba(199,157,69,0.15)]">
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Nome do elemento"
                    className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1"
                    style={{ 
                      borderColor: '#C79D45',
                      backgroundColor: 'rgba(26, 42, 29, 0.7)',
                      color: 'rgba(255, 255, 255, 0.95)',
                      '--tw-ring-color': '#C79D45'
                    } as React.CSSProperties}
                    autoFocus
                  />
                </div>
                {columns.map((column) => {
                  const width = columnWidths[column.id] || getColumnWidth(column)
                  return (
                    <div
                      key={column.id}
                      className="flex-shrink-0 px-4 py-3 border-r border-[rgba(199,157,69,0.15)]"
                      style={{ width: `${width}px`, minWidth: '100px' }}
                    />
                  )
                })}
                <div className="flex-shrink-0 px-4 py-3 flex gap-2 items-center">
                  <button
                    type="submit"
                    className="text-[#C79D45] hover:text-[#D4AD5F] text-sm font-medium"
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemInput(false)
                      setItemName('')
                    }}
                    className="text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
              ) : (
                <button
                  onClick={() => setShowItemInput(true)}
                  className="w-full flex items-center gap-2 px-5 py-3.5 text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] hover:bg-[rgba(199,157,69,0.12)] text-sm border-b border-[rgba(199,157,69,0.15)] transition-all duration-200 font-medium"
                >
                  <div className="w-10"></div>
                  <Plus size={16} className="text-[#C79D45]" />
                  <span>Adicionar elemento</span>
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  )
}

