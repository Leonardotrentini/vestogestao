'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Group } from '@/supabase/migrations/types'
import { ChevronRight, Plus } from 'lucide-react'

interface GroupsSidebarProps {
  boardId: string
  boardName?: string
  onCreateGroup: (name: string) => void
}

export default function GroupsSidebar({ boardId, boardName, onCreateGroup }: GroupsSidebarProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showGroupInput, setShowGroupInput] = useState(false)
  const [groupName, setGroupName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadGroups()
    
    // Subscribe to changes
    const channel = supabase
      .channel('groups_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'groups',
        filter: `board_id=eq.${boardId}`
      }, () => {
        loadGroups()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [boardId])

  const loadGroups = async () => {
    const { data } = await supabase
      .from('groups')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    setGroups(data || [])
    setLoading(false)
  }

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (groupName.trim()) {
      onCreateGroup(groupName.trim())
      setGroupName('')
      setShowGroupInput(false)
    }
  }

  const scrollToGroup = (groupId: string) => {
    const element = document.getElementById(`group-${groupId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900">{boardName || 'Quadro'}</h2>
          <span className="text-xs text-gray-500">Quadro principal</span>
        </div>
        
        {showGroupInput ? (
          <form onSubmit={handleCreateGroup} className="space-y-2">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nome do grupo"
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGroupInput(false)
                  setGroupName('')
                }}
                className="flex-1 text-gray-600 hover:text-gray-800 text-sm border border-gray-300 rounded px-3 py-1.5"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowGroupInput(true)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus size={16} />
            Novo Grupo
          </button>
        )}
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-xs text-gray-500 text-center py-4">Carregando...</div>
        ) : groups.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-4 px-2">
            Nenhum grupo criado ainda
          </div>
        ) : (
          <div className="space-y-0.5">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => scrollToGroup(group.id)}
                className="w-full text-left px-3 py-2 rounded-md text-sm transition-all text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                <span className="truncate text-sm">{group.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

