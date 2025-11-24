'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Subitem, Column } from '@/supabase/migrations/types'
import { MessageCircle } from 'lucide-react'
import ColumnCell from '../column/ColumnCell'

interface SubitemRowProps {
  subitem: Subitem
  columns: Column[]
  boardId: string
  onUpdate: () => void
}

export default function SubitemRow({ subitem, columns, boardId, onUpdate, onOpenItemModal }: SubitemRowProps) {
  const [columnValues, setColumnValues] = useState<Record<string, any>>({})
  const [commentsCount, setCommentsCount] = useState(0)
  const supabase = createClient()

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
    <div className="flex border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Checkbox */}
      <div className="w-8 px-2 py-2 flex items-center border-r border-gray-200">
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
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
      </div>

      {/* Nome do Subitem */}
      <div className="w-64 min-w-[256px] px-3 py-2 border-r border-gray-200 flex items-center gap-2">
        <span className={`text-sm flex-1 ${subitem.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
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
          className="relative flex-shrink-0 p-0.5 hover:bg-gray-200 rounded"
          title="Ver comentários"
        >
          <MessageCircle className="text-gray-500" size={14} />
          {commentsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gray-700 text-white text-[10px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
              {commentsCount > 99 ? '99+' : commentsCount}
            </span>
          )}
        </button>
      </div>

      {/* Colunas */}
      {columns.map((column) => (
        <div
          key={column.id}
          className="w-40 min-w-[160px] px-3 py-2 border-r border-gray-200"
        >
          <ColumnCell
            column={column}
            value={columnValues[column.id]}
            itemId={subitem.item_id}
            onChange={(value) => handleValueChange(column.id, value)}
            boardId={boardId}
          />
        </div>
      ))}
    </div>
  )
}

