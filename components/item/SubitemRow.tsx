'use client'

import { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'
import { Subitem, Column } from '@/supabase/migrations/types'
import { MessageCircle } from 'lucide-react'
import ColumnCell from '../column/ColumnCell'
import { getColumnWidth } from '@/lib/column-utils'

interface SubitemRowProps {
  subitem: Subitem
  columns: Column[]
  boardId: string
  onUpdate: () => void
  onOpenItemModal?: () => void
  columnWidths?: Record<string, number>
}

export default function SubitemRow({ subitem, columns, boardId, onUpdate, onOpenItemModal, columnWidths }: SubitemRowProps) {
  const [columnValues, setColumnValues] = useState<Record<string, any>>({})
  const [commentsCount, setCommentsCount] = useState(0)
  const supabase = createClient()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `subitem-${subitem.id}`,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  useEffect(() => {
    loadColumnValues()
    loadCommentsCount()
  }, [subitem.id])

  const loadColumnValues = async () => {
    const { data: values } = await supabase
      .from('column_values')
      .select('*, columns(*)')
      .eq('item_id', subitem.item_id)

    const valuesMap: Record<string, any> = {}
    values?.forEach((cv: any) => {
      if (cv.columns) {
        valuesMap[cv.columns.id] = cv.value
      }
    })

    setColumnValues(valuesMap)
  }

  const loadCommentsCount = async () => {
    // Contar comentários do item pai (por enquanto subitens compartilham comentários com o item)
    // TODO: Se quiser comentários próprios por subitem, criar uma coluna subitem_id na tabela comments
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', subitem.item_id)
    
    setCommentsCount(count || 0)
  }

  const handleValueChange = async (columnId: string, value: any) => {
    const column = columns.find(c => c.id === columnId)
    if (!column) return

    const existingValue = await supabase
      .from('column_values')
      .select('id')
      .eq('item_id', subitem.item_id)
      .eq('column_id', columnId)
      .single()

    if (existingValue.data) {
      await supabase
        .from('column_values')
        .update({ value })
        .eq('item_id', subitem.item_id)
        .eq('column_id', columnId)
    } else {
      await supabase
        .from('column_values')
        .insert({
          item_id: subitem.item_id,
          column_id: columnId,
          value,
        })
    }

    setColumnValues({ ...columnValues, [columnId]: value })
    onUpdate()
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex min-w-max border-b border-[rgba(199,157,69,0.2)] hover:bg-[rgba(199,157,69,0.05)] transition-colors ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Checkbox */}
      <div className="w-8 flex-shrink-0 px-2 py-2 flex items-center border-r border-[rgba(199,157,69,0.2)]">
        <input
          type="checkbox"
          checked={subitem.is_completed}
          onChange={async () => {
            await supabase
              .from('subitems')
              .update({ is_completed: !subitem.is_completed })
              .eq('id', subitem.id)
            onUpdate()
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-[#C79D45] border-[rgba(199,157,69,0.3)] rounded"
        />
      </div>

      {/* Nome do Subitem - Área arrastável */}
      <div className="w-64 flex-shrink-0 px-3 py-2 border-r border-[rgba(199,157,69,0.2)] flex items-center gap-2">
        <span 
          {...listeners}
          {...attributes}
          className="text-sm flex-1 text-[rgba(255,255,255,0.95)] cursor-grab active:cursor-grabbing"
        >
          {subitem.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            // Abrir modal do item pai (os subitens compartilham comentários com o item pai)
            if (onOpenItemModal) {
              onOpenItemModal()
            }
          }}
          className="relative flex-shrink-0 p-0.5 hover:bg-[rgba(199,157,69,0.1)] rounded"
          title="Ver comentários"
        >
          <MessageCircle className="text-[rgba(255,255,255,0.7)]" size={14} />
          {commentsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#C79D45] text-[#0F1711] text-[10px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
              {commentsCount > 99 ? '99+' : commentsCount}
            </span>
          )}
        </button>
      </div>

      {/* Colunas */}
      {columns.map((column) => {
        const width = columnWidths?.[column.id] || getColumnWidth(column)
        return (
          <div
            key={column.id}
            className="flex-shrink-0 px-3 py-2 border-r border-[rgba(199,157,69,0.2)]"
            style={{ width: `${width}px`, minWidth: '100px' }}
          >
                  <ColumnCell
                    column={column}
                    value={columnValues[column.id]}
                    itemId={subitem.item_id}
                    onChange={(value) => handleValueChange(column.id, value)}
                    boardId={boardId}
                    itemName={subitem.name}
                  />
          </div>
        )
      })}
    </div>
  )
}

