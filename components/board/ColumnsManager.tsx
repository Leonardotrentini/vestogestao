'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Column } from '@/supabase/migrations/types'
import { Plus, X, Settings } from 'lucide-react'

interface ColumnsManagerProps {
  boardId: string
  columns: Column[]
  onColumnsChange: () => void
}

const COLUMN_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'status', label: 'Status' },
  { value: 'person', label: 'Pessoa' },
  { value: 'priority', label: 'Prioridade' },
  { value: 'date', label: 'Data' },
  { value: 'number', label: 'Número' },
  { value: 'currency', label: 'Moeda' },
  { value: 'link', label: 'Link' },
  { value: 'long_text', label: 'Texto Longo' },
  { value: 'time_tracking', label: 'Controle de Tempo' },
  { value: 'checkbox', label: 'Checkbox' },
]

export default function ColumnsManager({ boardId, columns, onColumnsChange }: ColumnsManagerProps) {
  const [showManager, setShowManager] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnType, setNewColumnType] = useState('text')
  const supabase = createClient()

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColumnName.trim()) return

    const maxPosition = columns.length > 0 ? Math.max(...columns.map(c => c.position)) : 0

    await supabase.from('columns').insert({
      name: newColumnName.trim(),
      board_id: boardId,
      type: newColumnType,
      position: maxPosition + 1,
    })

    setNewColumnName('')
    setNewColumnType('text')
    setShowAddForm(false)
    onColumnsChange()
  }

  const handleDeleteColumn = async (columnId: string, columnName: string) => {
    if (confirm(`Tem certeza que deseja deletar a coluna "${columnName}"? Todos os valores serão removidos.`)) {
      await supabase
        .from('columns')
        .delete()
        .eq('id', columnId)
      onColumnsChange()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowManager(!showManager)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-[rgba(255,255,255,0.7)] hover:bg-[rgba(199,157,69,0.1)] hover:text-[rgba(255,255,255,0.95)] rounded transition-colors"
      >
        <Settings size={16} />
        Colunas
      </button>

      {showManager && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40" 
            onClick={() => setShowManager(false)}
          />
          <div className="absolute right-0 top-full mt-2 bg-[#1A2A1D] border border-[rgba(199,157,69,0.3)] rounded-lg shadow-lg z-50 w-80 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-[rgba(199,157,69,0.2)]">
              <h3 className="font-semibold text-[rgba(255,255,255,0.95)] mb-2">Gerenciar Colunas</h3>
              
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] rounded-lg hover:from-[#D4AD5F] hover:to-[#E5C485] text-sm font-semibold transition-all"
                >
                  <Plus size={16} />
                  Adicionar Coluna
                </button>
              ) : (
                <form onSubmit={handleAddColumn} className="space-y-2">
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Nome da coluna"
                    className="w-full px-3 py-2 border border-[rgba(199,157,69,0.2)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#C79D45] transition-all"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      color: 'rgba(255, 255, 255, 0.95)'
                    } as React.CSSProperties}
                    autoFocus
                  />
                  <select
                    value={newColumnType}
                    onChange={(e) => setNewColumnType(e.target.value)}
                    className="w-full px-3 py-2 border border-[rgba(199,157,69,0.2)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#C79D45] transition-all"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      color: 'rgba(255, 255, 255, 0.95)'
                    } as React.CSSProperties}
                  >
                    {COLUMN_TYPES.map(type => (
                      <option 
                        key={type.value} 
                        value={type.value}
                        style={{
                          backgroundColor: '#1A2A1D',
                          color: 'rgba(255, 255, 255, 0.95)'
                        }}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] rounded text-sm hover:from-[#D4AD5F] hover:to-[#E5C485] font-semibold transition-all"
                    >
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setNewColumnName('')
                      }}
                      className="px-3 py-2 bg-[rgba(0,0,0,0.3)] text-[rgba(255,255,255,0.7)] rounded text-sm hover:bg-[rgba(0,0,0,0.4)] transition-colors border border-[rgba(199,157,69,0.2)]"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="p-2">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="flex items-center justify-between p-2 hover:bg-[rgba(199,157,69,0.1)] rounded transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[rgba(255,255,255,0.95)] truncate">
                      {column.name}
                    </div>
                    <div className="text-xs text-[rgba(255,255,255,0.5)]">
                      {COLUMN_TYPES.find(t => t.value === column.type)?.label || column.type}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteColumn(column.id, column.name)}
                    className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                    title="Deletar coluna"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

