'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Item, Column, ColumnValue } from '@/types'
import ColumnCell from '../column/ColumnCell'
import ItemDetailModal from './ItemDetailModal'

interface ItemRowProps {
  item: Item
  columns: Column[]
  boardId: string
}

export default function ItemRow({ item, columns, boardId }: ItemRowProps) {
  const [columnValues, setColumnValues] = useState<Record<string, ColumnValue>>({})
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadColumnValues()
  }, [item.id])

  const loadColumnValues = async () => {
    const { data } = await supabase
      .from('column_values')
      .select('*')
      .eq('item_id', item.id)

    const values: Record<string, ColumnValue> = {}
    data?.forEach((cv) => {
      values[cv.column_id] = cv
    })
    setColumnValues(values)
  }

  const handleCellUpdate = async (columnId: string, value: any) => {
    const existing = columnValues[columnId]

    if (existing) {
      await supabase
        .from('column_values')
        .update({ value })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('column_values')
        .insert({
          item_id: item.id,
          column_id: columnId,
          value,
        })
    }

    loadColumnValues()
  }

  return (
    <>
      <div
        className="flex border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="w-64 p-3 border-r border-gray-200">
          <div className="font-medium text-gray-900">{item.name}</div>
        </div>
        {columns.map((column) => (
          <div
            key={column.id}
            className="w-40 p-3 border-r border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <ColumnCell
              column={column}
              value={columnValues[column.id]?.value}
              itemId={item.id}
              onChange={(value) => handleCellUpdate(column.id, value)}
            />
          </div>
        ))}
      </div>

      {showModal && (
        <ItemDetailModal
          item={item}
          columns={columns}
          columnValues={columnValues}
          onClose={() => setShowModal(false)}
          onUpdate={loadColumnValues}
        />
      )}
    </>
  )
}

