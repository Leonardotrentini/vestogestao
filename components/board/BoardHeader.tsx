'use client'

import { useState } from 'react'
import { Plus, LayoutGrid, Table } from 'lucide-react'
import { Column } from '@/supabase/migrations/types'
import ColumnsManager from './ColumnsManager'
import SeedGestaoClientesButton from '@/components/workspace/SeedGestaoClientesButton'

interface BoardHeaderProps {
  boardName?: string
  onCreateGroup: (name: string) => void
  boardId?: string
  workspaceId?: string
  columns?: Column[]
  onColumnsChange?: () => void
  viewMode?: 'table' | 'kanban'
  onViewModeChange?: (mode: 'table' | 'kanban') => void
}

export default function BoardHeader({ boardName, onCreateGroup, boardId, workspaceId, columns = [], onColumnsChange, viewMode = 'table', onViewModeChange }: BoardHeaderProps) {
  const [showGroupInput, setShowGroupInput] = useState(false)
  const [groupName, setGroupName] = useState('')

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (groupName.trim()) {
      onCreateGroup(groupName.trim())
      setGroupName('')
      setShowGroupInput(false)
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">{boardName || 'Quadro'}</h1>
          <span className="text-xs text-gray-500">Quadro principal</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Toggle de Visualização */}
          {onViewModeChange && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('table')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Visualização em Tabela"
              >
                <div className="flex items-center gap-2">
                  <Table size={16} />
                  <span>Tabela</span>
                </div>
              </button>
              <button
                onClick={() => onViewModeChange('kanban')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Visualização em Kanban"
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid size={16} />
                  <span>Kanban</span>
                </div>
              </button>
            </div>
          )}
          {boardName === 'Gestão de Clientes' && workspaceId && (
            <SeedGestaoClientesButton workspaceId={workspaceId} />
          )}
          {boardId && columns && onColumnsChange && (
            <ColumnsManager 
              boardId={boardId} 
              columns={columns} 
              onColumnsChange={onColumnsChange}
            />
          )}
          {showGroupInput ? (
            <form onSubmit={handleCreateGroup} className="flex items-center gap-2">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Nome do grupo"
                className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGroupInput(false)
                  setGroupName('')
                }}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancelar
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowGroupInput(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Plus size={16} />
              Criar grupo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
