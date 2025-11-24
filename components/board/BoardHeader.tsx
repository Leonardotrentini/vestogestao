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
    <div className="bg-[#1A2A1D] border-b border-[rgba(199,157,69,0.2)] sticky top-0 z-40 backdrop-blur-xl">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] font-main">{boardName || 'Quadro'}</h1>
          <span className="text-xs text-[rgba(255,255,255,0.5)]">Quadro principal</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Toggle de Visualização */}
          {onViewModeChange && (
            <div className="flex items-center bg-[rgba(0,0,0,0.3)] rounded-lg p-1 border border-[rgba(199,157,69,0.3)]">
              <button
                onClick={() => onViewModeChange('table')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[rgba(199,157,69,0.2)] text-[#C79D45] shadow-sm border border-[rgba(199,157,69,0.4)]'
                    : 'text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] hover:bg-[rgba(199,157,69,0.1)]'
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
                    ? 'bg-[rgba(199,157,69,0.2)] text-[#C79D45] shadow-sm border border-[rgba(199,157,69,0.4)]'
                    : 'text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] hover:bg-[rgba(199,157,69,0.1)]'
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
                className="px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 placeholder:text-gray-400"
                style={{ 
                  borderColor: 'rgba(199, 157, 69, 0.2)',
                  backgroundColor: 'rgba(26, 42, 29, 0.7)',
                  color: 'rgba(255, 255, 255, 0.95)',
                  '--tw-ring-color': '#C79D45'
                } as React.CSSProperties}
                autoFocus
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] px-3 py-1.5 rounded text-sm font-semibold hover:from-[#D4AD5F] hover:to-[#E5C485] transition-all shadow-[0_4px_16px_rgba(199,157,69,0.25)]"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGroupInput(false)
                  setGroupName('')
                }}
                className="text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] text-sm"
              >
                Cancelar
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowGroupInput(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] px-4 py-2 rounded-lg hover:from-[#D4AD5F] hover:to-[#E5C485] text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(199,157,69,0.25)]"
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
