'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Item, Column, ColumnValue, Subitem } from '@/types'
import { X } from 'lucide-react'

interface ItemDetailModalProps {
  item: Item
  columns: Column[]
  columnValues: Record<string, ColumnValue>
  onClose: () => void
  onUpdate: () => void
}

export default function ItemDetailModal({
  item,
  columns,
  columnValues,
  onClose,
  onUpdate,
}: ItemDetailModalProps) {
  const [subitems, setSubitems] = useState<Subitem[]>([])
  const [newSubitemName, setNewSubitemName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadSubitems()
  }, [item.id])

  const loadSubitems = async () => {
    const { data } = await supabase
      .from('subitems')
      .select('*')
      .eq('item_id', item.id)
      .order('position', { ascending: true })

    setSubitems(data || [])
  }

  const handleCreateSubitem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubitemName.trim()) return

    const maxPosition = subitems.length

    await supabase.from('subitems').insert({
      name: newSubitemName.trim(),
      item_id: item.id,
      position: maxPosition,
    })

    setNewSubitemName('')
    loadSubitems()
  }

  const handleToggleSubitem = async (subitemId: string, isCompleted: boolean) => {
    await supabase
      .from('subitems')
      .update({ is_completed: !isCompleted })
      .eq('id', subitemId)

    loadSubitems()
  }

  const handleDeleteSubitem = async (subitemId: string) => {
    await supabase.from('subitems').delete().eq('id', subitemId)
    loadSubitems()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Colunas */}
          <div className="space-y-4">
            {columns.map((column) => (
              <div key={column.id} className="border-b border-gray-200 pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {column.name}
                </label>
                {/* Aqui você pode adicionar editores específicos para cada tipo de coluna */}
                <div className="text-gray-600">
                  {columnValues[column.id]?.value ? (
                    <pre className="text-sm">
                      {JSON.stringify(columnValues[column.id]?.value, null, 2)}
                    </pre>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Subitens */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subitens</h3>
            
            <div className="space-y-2 mb-4">
              {subitems.map((subitem) => (
                <div
                  key={subitem.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={subitem.is_completed}
                    onChange={() => handleToggleSubitem(subitem.id, subitem.is_completed)}
                    className="w-4 h-4"
                  />
                  <span
                    className={`flex-1 ${subitem.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}
                  >
                    {subitem.name}
                  </span>
                  <button
                    onClick={() => handleDeleteSubitem(subitem.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateSubitem} className="flex gap-2">
              <input
                type="text"
                value={newSubitemName}
                onChange={(e) => setNewSubitemName(e.target.value)}
                placeholder="Adicionar subitem"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Adicionar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

