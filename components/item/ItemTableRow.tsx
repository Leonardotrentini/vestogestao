'use client'

import { useState, useEffect } from 'react'
import { useDraggable, DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'
import { Item, Column, Subitem } from '@/supabase/migrations/types'
import { X, ChevronDown, ChevronRight, MessageCircle, Pencil, Plus, Loader2 } from 'lucide-react'
import ColumnCell from '../column/ColumnCell'
import ItemDetailModal from './ItemDetailModal'
import SubitemRow from './SubitemRow'
import { getColumnWidth } from '@/lib/column-utils'
import { useToast } from '@/components/common/ToastProvider'
import ConfirmModal from '@/components/common/ConfirmModal'

interface ItemTableRowProps {
  item: Item
  columns: Column[]
  boardId: string
  columnWidths?: Record<string, number>
}

export default function ItemTableRow({ item, columns, boardId, columnWidths }: ItemTableRowProps) {
  const [columnValues, setColumnValues] = useState<Record<string, any>>({})
  const [showModal, setShowModal] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [itemName, setItemName] = useState(item.name)
  const [subitemsCount, setSubitemsCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [subitems, setSubitems] = useState<Subitem[]>([])
  const [newSubitemName, setNewSubitemName] = useState('')
  const [isCreatingSubitem, setIsCreatingSubitem] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSavingName, setIsSavingName] = useState(false)
  const supabase = createClient()
  const { showSuccess, showError } = useToast()

  // Sensores para drag-and-drop dos subitems
  const subitemsSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: item.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  useEffect(() => {
    setItemName(item.name)
    loadColumnValues()
    loadSubitemsCount()
    loadCommentsCount()
    if (isExpanded) {
      loadSubitems()
    }
  }, [item.id, item.name, isExpanded])

  const loadSubitemsCount = async () => {
    const { count } = await supabase
      .from('subitems')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', item.id)
    
    setSubitemsCount(count || 0)
  }

  const loadCommentsCount = async () => {
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', item.id)
    
    setCommentsCount(count || 0)
  }

  const loadSubitems = async () => {
    const { data } = await supabase
      .from('subitems')
      .select('*')
      .eq('item_id', item.id)
      .order('position', { ascending: true })
    
    setSubitems(data || [])
  }

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
    if (!isExpanded && subitems.length === 0) {
      loadSubitems()
    }
  }

  const loadColumnValues = async () => {
    const { data: values } = await supabase
      .from('column_values')
      .select('*, columns(*)')
      .eq('item_id', item.id)

    const valuesMap: Record<string, any> = {}
    values?.forEach((cv: any) => {
      if (cv.columns) {
        valuesMap[cv.columns.id] = cv.value
      }
    })

    // Load time tracking
    const { data: timeTracking } = await supabase
      .from('time_tracking')
      .select('*')
      .eq('item_id', item.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (timeTracking) {
      columns.forEach(col => {
        if (col.type === 'time_tracking') {
          valuesMap[col.id] = timeTracking.duration_seconds || 0
        }
      })
    }

    setColumnValues(valuesMap)
  }

  const handleValueChange = async (columnId: string, value: any) => {
    const column = columns.find(c => c.id === columnId)
    if (!column) return

    if (column.type === 'time_tracking') {
      return
    }

    const existingValue = await supabase
      .from('column_values')
      .select('id')
      .eq('item_id', item.id)
      .eq('column_id', columnId)
      .single()

    if (existingValue.data) {
      await supabase
        .from('column_values')
        .update({ value })
        .eq('item_id', item.id)
        .eq('column_id', columnId)
    } else {
      await supabase
        .from('column_values')
        .insert({
          item_id: item.id,
          column_id: columnId,
          value,
        })
    }

    setColumnValues({ ...columnValues, [columnId]: value })
  }

  const handleNameUpdate = async (newName: string) => {
    const trimmedName = newName.trim()
    if (trimmedName && trimmedName !== item.name && !isSavingName) {
      setIsSavingName(true)
      try {
        const { error } = await supabase
          .from('items')
          .update({ name: trimmedName })
          .eq('id', item.id)
        
        if (error) throw error
        
        setItemName(trimmedName)
        item.name = trimmedName
        showSuccess('Nome atualizado!')
      } catch (error) {
        console.error('Erro ao atualizar nome:', error)
        showError('Erro ao atualizar nome')
        setItemName(item.name)
      } finally {
        setIsSavingName(false)
        setIsEditingName(false)
      }
    } else {
      setIsEditingName(false)
    }
  }

  const handleCancelEdit = () => {
    setItemName(item.name)
    setIsEditingName(false)
  }

  const handleDeleteItem = async () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', item.id)
      
      if (error) throw error
      
      showSuccess('Item deletado com sucesso!')
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Erro ao deletar item:', error)
      showError('Erro ao deletar item')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreateSubitem = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    const trimmedName = newSubitemName.trim()
    if (!trimmedName || isCreatingSubitem) {
      setIsCreatingSubitem(false)
      return
    }

    setIsCreatingSubitem(true)
    try {
      const maxPosition = subitems.length > 0 
        ? Math.max(...subitems.map(s => s.position))
        : -1

      const { error } = await supabase
        .from('subitems')
        .insert({
          name: trimmedName,
          item_id: item.id,
          position: maxPosition + 1,
          is_completed: false,
        })

      if (error) throw error

      setNewSubitemName('')
      setIsCreatingSubitem(false)
      loadSubitems()
      loadSubitemsCount()
      showSuccess('Subitem criado!')
    } catch (error) {
      console.error('Erro ao criar subitem:', error)
      showError('Erro ao criar subitem')
      setIsCreatingSubitem(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreateSubitem()
    } else if (e.key === 'Escape') {
      setNewSubitemName('')
      setIsCreatingSubitem(false)
    }
  }

  const handleSubitemDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = subitems.findIndex((s) => `subitem-${s.id}` === active.id)
    const newIndex = subitems.findIndex((s) => `subitem-${s.id}` === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Atualizar estado local imediatamente
    const newSubitems = arrayMove(subitems, oldIndex, newIndex)
    setSubitems(newSubitems)

    // Atualizar posições no banco de dados
    try {
      const updates = newSubitems.map((subitem, index) => ({
        id: subitem.id,
        position: index,
      }))

      // Atualizar todos os subitems de uma vez
      for (const update of updates) {
        await supabase
          .from('subitems')
          .update({ position: update.position })
          .eq('id', update.id)
      }

      // Recarregar para garantir sincronização
      loadSubitems()
    } catch (error) {
      console.error('Erro ao atualizar posições dos subitems:', error)
      // Reverter em caso de erro
      loadSubitems()
    }
  }

  return (
    <>
      <div 
        ref={setNodeRef}
        style={style}
        className={`flex min-w-max border-b border-[rgba(199,157,69,0.15)] hover:bg-[rgba(199,157,69,0.08)] hover:border-[rgba(199,157,69,0.3)] transition-all duration-200 group/item-row ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
      >
        {/* Checkbox */}
        <div className="w-10 flex-shrink-0 px-3 py-3.5 flex items-center border-r border-[rgba(199,157,69,0.15)]">
          <input
            type="checkbox"
            className="w-4 h-4 text-[#C79D45] border-[rgba(199,157,69,0.3)] rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Nome do Item - Área arrastável */}
        <div 
          className="w-72 flex-shrink-0 px-4 py-3.5 border-r border-[rgba(199,157,69,0.15)] flex items-center bg-[rgba(26,42,29,0.3)] group-hover/item-row:bg-[rgba(26,42,29,0.5)] transition-colors"
        >
          {isEditingName ? (
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  e.stopPropagation()
                  handleNameUpdate(itemName)
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  e.stopPropagation()
                  handleCancelEdit()
                }
              }}
              onBlur={(e) => {
                // Só salvar no blur se o valor mudou
                if (itemName.trim() !== item.name) {
                  handleNameUpdate(itemName)
                } else {
                  handleCancelEdit()
                }
              }}
              className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1"
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
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleExpand(e)
                }}
                className="flex-shrink-0 p-0.5 hover:bg-[rgba(199,157,69,0.1)] rounded"
                title={isExpanded ? "Recolher este elemento" : "Expandir este elemento"}
              >
                {isExpanded ? (
                  <ChevronDown className="text-[rgba(255,255,255,0.7)]" size={16} />
                ) : (
                  <ChevronRight className="text-[rgba(255,255,255,0.7)]" size={16} />
                )}
              </button>
              <span 
                {...listeners}
                {...attributes}
                className="text-sm text-[rgba(255,255,255,0.95)] flex-1 cursor-grab active:cursor-grabbing"
                onClick={() => setShowModal(true)}
              >
                {itemName}
              </span>
              {subitemsCount > 0 && (
                <span className="text-xs bg-[rgba(199,157,69,0.15)] text-[rgba(255,255,255,0.7)] px-2 py-0.5 rounded">
                  {subitemsCount}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditingName(true)
                }}
                className="opacity-0 group-hover/item-row:opacity-100 flex-shrink-0 p-1 hover:bg-[rgba(199,157,69,0.1)] rounded transition-opacity"
                title="Editar nome"
              >
                <Pencil className="text-[rgba(255,255,255,0.7)]" size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowModal(true)
                }}
                className="relative flex-shrink-0 p-1 hover:bg-[rgba(199,157,69,0.1)] rounded"
                title="Ver comentários"
              >
                <MessageCircle className="text-[rgba(255,255,255,0.7)]" size={16} />
                {commentsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C79D45] text-[#0F1711] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {commentsCount > 99 ? '99+' : commentsCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Colunas */}
        {columns.map((column) => {
          const width = columnWidths?.[column.id] || getColumnWidth(column)
          return (
            <div
              key={column.id}
              className="flex-shrink-0 px-4 py-3.5 border-r border-[rgba(199,157,69,0.15)] hover:bg-[rgba(199,157,69,0.03)] transition-colors"
              style={{ width: `${width}px`, minWidth: '100px' }}
              onClick={(e) => e.stopPropagation()}
            >
                  <ColumnCell
                    column={column}
                    value={columnValues[column.id]}
                    itemId={item.id}
                    onChange={(value) => handleValueChange(column.id, value)}
                    boardId={boardId}
                    itemName={item.name}
                  />
            </div>
          )
        })}
        
        {/* Botão deletar (aparece no hover) */}
        <div className="flex-shrink-0 px-2 py-2 flex items-center opacity-0 group-hover/item-row:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteItem()
            }}
            className="p-1 hover:bg-[rgba(239,68,68,0.2)] rounded text-[rgba(252,165,165,1)]"
            title="Deletar item"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Subitens expandidos */}
      {isExpanded && (
        <div className="bg-[#1A2A1D] border-b border-[rgba(199,157,69,0.2)]">
          <DndContext
            sensors={subitemsSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSubitemDragEnd}
          >
            <SortableContext
              items={subitems.map((s) => `subitem-${s.id}`)}
              strategy={verticalListSortingStrategy}
            >
              {/* Linhas dos subitens */}
              {subitems.map((subitem) => (
                <SubitemRow
                  key={subitem.id}
                  subitem={subitem}
                  columns={columns}
                  boardId={boardId}
                  onUpdate={loadSubitems}
                  onOpenItemModal={() => setShowModal(true)}
                  columnWidths={columnWidths}
                />
              ))}
            </SortableContext>
          </DndContext>
          
          {/* Campo para adicionar novo subitem */}
          <div className="flex min-w-max border-b border-[rgba(199,157,69,0.2)] hover:bg-[rgba(199,157,69,0.05)] transition-colors">
            <div className="w-8 flex-shrink-0 px-2 py-2 border-r border-[rgba(199,157,69,0.2)]"></div>
            <div className="w-64 flex-shrink-0 px-3 py-2 border-r border-[rgba(199,157,69,0.2)] flex items-center gap-2">
              {isCreatingSubitem ? (
                <form onSubmit={handleCreateSubitem} className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={newSubitemName}
                    onChange={(e) => setNewSubitemName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      if (!newSubitemName.trim()) {
                        setIsCreatingSubitem(false)
                      }
                    }}
                    placeholder="Nome do subelemento..."
                    className="flex-1 px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1"
                    style={{ 
                      borderColor: '#C79D45',
                      backgroundColor: 'rgba(26, 42, 29, 0.7)',
                      color: 'rgba(255, 255, 255, 0.95)',
                      '--tw-ring-color': '#C79D45'
                    } as React.CSSProperties}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isCreatingSubitem}
                    className="flex-shrink-0 p-1.5 bg-[#C79D45] text-[#0F1711] rounded hover:bg-[#D4AD5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    title="Adicionar subelemento"
                  >
                    {isCreatingSubitem ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSubitemName('')
                      setIsCreatingSubitem(false)
                    }}
                    className="flex-shrink-0 p-1.5 hover:bg-[rgba(239,68,68,0.2)] rounded text-[rgba(252,165,165,1)] transition-colors"
                    title="Cancelar"
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setIsCreatingSubitem(true)
                    setNewSubitemName('')
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] hover:bg-[rgba(199,157,69,0.1)] rounded transition-colors border border-dashed border-[rgba(199,157,69,0.3)] hover:border-[rgba(199,157,69,0.5)] w-full"
                >
                  <Plus size={14} />
                  <span>Adicionar subelemento</span>
                </button>
              )}
            </div>
            {/* Espaçadores para as colunas */}
            {columns.map((column) => {
              const width = columnWidths?.[column.id] || getColumnWidth(column)
              return (
                <div
                  key={column.id}
                  className="flex-shrink-0 px-3 py-2 border-r border-[rgba(199,157,69,0.2)]"
                  style={{ width: `${width}px`, minWidth: '100px' }}
                />
              )
            })}
          </div>
        </div>
      )}

      {showModal && (
        <ItemDetailModal
          item={item}
          columns={columns}
          boardId={boardId}
          onClose={() => {
            setShowModal(false)
            loadColumnValues()
            loadSubitemsCount()
          }}
          onUpdate={() => {
            loadColumnValues()
            loadSubitemsCount()
          }}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Deletar item"
        message={`Tem certeza que deseja deletar o item "${item.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  )
}

