'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
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
    <div id={`group-${group.id}`} className="border-b border-[rgba(199,157,69,0.2)]">
      {/* Header do Grupo */}
      <div className="flex items-center bg-[#1A2A1D] border-b border-[rgba(199,157,69,0.2)] px-4 py-2 hover:bg-[rgba(199,157,69,0.1)] group/header">
        <div 
          className="flex items-center gap-2 flex-shrink-0 w-64 cursor-pointer"
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
            <span className="text-sm font-medium text-[rgba(255,255,255,0.95)]">{group.name}</span>
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
        <div className="bg-[#0F1711]">
          {/* Header das Colunas */}
          <div className="sticky top-0 z-20 bg-[#0F1711] border-b border-[rgba(199,157,69,0.2)]">
            <div className="flex min-w-max">
              <div className="w-8 flex-shrink-0 px-2 py-2 border-r border-[rgba(199,157,69,0.2)]"></div>
              <div className="w-64 flex-shrink-0 px-3 py-2 border-r border-[rgba(199,157,69,0.2)] bg-[#1A2A1D]">
                <span className="text-xs font-semibold text-[rgba(255,255,255,0.7)] uppercase tracking-wide">Elemento</span>
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
              <div className="flex min-w-max border-b border-[rgba(199,157,69,0.2)]">
                <div className="w-8 flex-shrink-0 px-2 py-3 border-r border-[rgba(199,157,69,0.2)]"></div>
                <div className="w-64 flex-shrink-0 px-3 py-3 border-r border-[rgba(199,157,69,0.2)] text-sm text-[rgba(255,255,255,0.7)]">
                  Nenhum elemento
                </div>
                {columns.map((column) => {
                  const width = columnWidths[column.id] || getColumnWidth(column)
                  return (
                    <div 
                      key={column.id} 
                      className="flex-shrink-0 px-3 py-3 border-r border-[rgba(199,157,69,0.2)]"
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
              <form onSubmit={handleCreateItem} className="flex min-w-max border-b border-[rgba(199,157,69,0.2)]">
                <div className="w-8 flex-shrink-0 px-2 py-2 border-r border-[rgba(199,157,69,0.2)]"></div>
                <div className="w-64 flex-shrink-0 px-3 py-2 border-r border-[rgba(199,157,69,0.2)]">
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
                      className="flex-shrink-0 px-3 py-2 border-r border-[rgba(199,157,69,0.2)]"
                      style={{ width: `${width}px`, minWidth: '100px' }}
                    />
                  )
                })}
                <div className="flex-shrink-0 px-3 py-2 flex gap-2 items-center">
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
                className="w-full flex items-center gap-2 px-4 py-2 text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] hover:bg-[rgba(199,157,69,0.1)] text-sm border-b border-[rgba(199,157,69,0.2)] transition-colors"
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

