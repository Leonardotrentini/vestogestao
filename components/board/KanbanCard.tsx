'use client'

import { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Item, Column } from '@/supabase/migrations/types'
import { MessageCircle, GripVertical } from 'lucide-react'
import ColumnCell from '../column/ColumnCell'
import { createClient } from '@/lib/supabase/client'
import ItemDetailModal from '../item/ItemDetailModal'

interface KanbanCardProps {
  item: Item
  columns: Column[]
  boardId: string
  isDragging?: boolean
}

export default function KanbanCard({ item, columns, boardId, isDragging = false }: KanbanCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [columnValues, setColumnValues] = useState<Record<string, any>>({})
  const [commentsCount, setCommentsCount] = useState(0)
  const [subitemsCount, setSubitemsCount] = useState(0)
  const supabase = createClient()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: item.id,
    disabled: isDragging,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  useEffect(() => {
    loadColumnValues()
    loadCommentsCount()
    loadSubitemsCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])

  const loadColumnValues = async () => {
    const { data: values } = await supabase
      .from('column_values')
      .select('*')
      .eq('item_id', item.id)

    const valuesMap: Record<string, any> = {}
    values?.forEach((cv) => {
      valuesMap[cv.column_id] = cv.value
    })
    setColumnValues(valuesMap)
  }

  const loadCommentsCount = async () => {
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', item.id)
    
    setCommentsCount(count || 0)
  }

  const loadSubitemsCount = async () => {
    const { count } = await supabase
      .from('subitems')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', item.id)
    
    setSubitemsCount(count || 0)
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

  // Pegar colunas principais para mostrar no card
  const mainColumns = columns.slice(0, 2) // Mostrar apenas as 2 primeiras colunas no card
  const statusColumn = columns.find(c => c.type === 'status')

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow ${
          isSortableDragging ? 'opacity-50' : ''
        }`}
      >
        {/* Drag Handle */}
        <div
          {...listeners}
          {...attributes}
          className="flex items-center gap-2 mb-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </div>
        
        {/* Conteúdo clicável */}
        <div
          onClick={() => !isSortableDragging && setShowModal(true)}
          className="cursor-pointer"
        >

        {/* Nome do Item */}
        <h4 className="font-medium text-gray-900 mb-2">{item.name}</h4>

        {/* Colunas Principais */}
        <div className="space-y-1 mb-2">
          {statusColumn && (
            <div className="text-xs">
              <ColumnCell
                column={statusColumn}
                value={columnValues[statusColumn.id]}
                itemId={item.id}
                onChange={(value) => handleValueChange(statusColumn.id, value)}
                boardId={boardId}
              />
            </div>
          )}
          {mainColumns.filter(c => c.type !== 'status').slice(0, 1).map((column) => (
            <div key={column.id} className="text-xs text-gray-600">
              <ColumnCell
                column={column}
                value={columnValues[column.id]}
                itemId={item.id}
                onChange={(value) => handleValueChange(column.id, value)}
                boardId={boardId}
              />
            </div>
          ))}
        </div>

          {/* Footer com badges */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            {subitemsCount > 0 && (
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                {subitemsCount}
              </span>
            )}
            {commentsCount > 0 && (
              <div className="flex items-center gap-1 text-gray-500">
                <MessageCircle size={12} />
                <span className="text-xs">{commentsCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ItemDetailModal
          item={item}
          columns={columns}
          boardId={boardId}
          onClose={() => {
            setShowModal(false)
            loadColumnValues()
          }}
          onUpdate={() => {
            loadColumnValues()
            loadCommentsCount()
            loadSubitemsCount()
          }}
        />
      )}
    </>
  )
}

