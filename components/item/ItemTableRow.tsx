'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Item, Column, Subitem } from '@/supabase/migrations/types'
import { X, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react'
import ColumnCell from '../column/ColumnCell'
import ItemDetailModal from './ItemDetailModal'
import SubitemRow from './SubitemRow'

interface ItemTableRowProps {
  item: Item
  columns: Column[]
  boardId: string
}

export default function ItemTableRow({ item, columns, boardId }: ItemTableRowProps) {
  const [columnValues, setColumnValues] = useState<Record<string, any>>({})
  const [showModal, setShowModal] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [itemName, setItemName] = useState(item.name)
  const [subitemsCount, setSubitemsCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [subitems, setSubitems] = useState<Subitem[]>([])
  const supabase = createClient()

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
    if (newName.trim() && newName !== item.name) {
      await supabase
        .from('items')
        .update({ name: newName.trim() })
        .eq('id', item.id)
      setItemName(newName.trim())
    }
    setIsEditingName(false)
  }

  const handleDeleteItem = async () => {
    if (confirm(`Tem certeza que deseja deletar o item "${item.name}"?`)) {
      await supabase
        .from('items')
        .delete()
        .eq('id', item.id)
    }
  }

  return (
    <>
      <div className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors group/item-row">
        {/* Checkbox */}
        <div className="w-8 px-2 py-2 flex items-center border-r border-gray-200">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Nome do Item */}
        <div 
          className="w-64 min-w-[256px] px-3 py-2 border-r border-gray-200 flex items-center cursor-pointer"
          onClick={() => setShowModal(true)}
          onDoubleClick={(e) => {
            e.stopPropagation()
            setIsEditingName(true)
          }}
        >
          {isEditingName ? (
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onBlur={() => handleNameUpdate(itemName)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNameUpdate(itemName)
                } else if (e.key === 'Escape') {
                  setItemName(item.name)
                  setIsEditingName(false)
                }
              }}
              className="w-full px-2 py-1 border border-blue-400 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={handleToggleExpand}
                className="flex-shrink-0 p-0.5 hover:bg-gray-200 rounded"
                title={isExpanded ? "Recolher este elemento" : "Expandir este elemento"}
              >
                {isExpanded ? (
                  <ChevronDown className="text-gray-500" size={16} />
                ) : (
                  <ChevronRight className="text-gray-500" size={16} />
                )}
              </button>
              <span className="text-sm text-gray-900 flex-1">{item.name}</span>
              {subitemsCount > 0 && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                  {subitemsCount}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowModal(true)
                }}
                className="relative flex-shrink-0 p-1 hover:bg-gray-200 rounded"
                title="Ver comentários"
              >
                <MessageCircle className="text-gray-500" size={16} />
                {commentsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-700 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {commentsCount > 99 ? '99+' : commentsCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Colunas */}
        {columns.map((column) => (
          <div
            key={column.id}
            className="w-40 min-w-[160px] px-3 py-2 border-r border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <ColumnCell
              column={column}
              value={columnValues[column.id]}
              itemId={item.id}
              onChange={(value) => handleValueChange(column.id, value)}
              boardId={boardId}
            />
          </div>
        ))}
        
        {/* Botão deletar (aparece no hover) */}
        <div className="px-2 py-2 flex items-center opacity-0 group-hover/item-row:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteItem()
            }}
            className="p-1 hover:bg-red-100 rounded text-red-600"
            title="Deletar item"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Subitens expandidos */}
      {isExpanded && subitems.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-200">
          {/* Header para subitens */}
          <div className="flex border-b border-gray-200 bg-white">
            <div className="w-8 px-2 py-2 border-r border-gray-200"></div>
            <div className="w-64 min-w-[256px] px-3 py-2 border-r border-gray-200 bg-gray-50">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Subelemento</span>
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
          {/* Linhas dos subitens */}
          {subitems.map((subitem) => (
            <SubitemRow
              key={subitem.id}
              subitem={subitem}
              columns={columns}
              boardId={boardId}
              onUpdate={loadSubitems}
              onOpenItemModal={() => setShowModal(true)}
            />
          ))}
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
    </>
  )
}

