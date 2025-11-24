'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Board } from '@/supabase/migrations/types'
import { LayoutDashboard, Plus } from 'lucide-react'

interface SidebarProps {
  workspaceId: string
  currentBoardId?: string
}

export default function Sidebar({ workspaceId, currentBoardId }: SidebarProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    loadBoards()
    
    // Subscribe to changes
    const channel = supabase
      .channel('boards_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'boards',
        filter: `workspace_id=eq.${workspaceId}`
      }, () => {
        loadBoards()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workspaceId])

  const loadBoards = async () => {
    const { data } = await supabase
      .from('boards')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    setBoards(data || [])
    setLoading(false)
  }

  const handleBoardClick = (boardId: string) => {
    router.push(`/workspaces/${workspaceId}/boards/${boardId}`)
  }

  const handleNewBoard = () => {
    router.push(`/workspaces/${workspaceId}/boards/new`)
  }

  const isActive = (boardId: string) => {
    return pathname?.includes(`/boards/${boardId}`)
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quadros
          </h2>
        </div>
        <button
          onClick={handleNewBoard}
          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus size={16} />
          Novo Quadro
        </button>
      </div>

      {/* Boards List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-xs text-gray-500 text-center py-4">Carregando...</div>
        ) : boards.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-4 px-2">
            Nenhum quadro criado ainda
          </div>
        ) : (
          <div className="space-y-0.5">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => handleBoardClick(board.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                  isActive(board.id)
                    ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard 
                    size={14} 
                    className={isActive(board.id) ? 'text-blue-600' : 'text-gray-400'}
                  />
                  <span className="truncate text-sm">{board.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <button
          onClick={() => router.push(`/workspaces/${workspaceId}`)}
          className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
        >
          ← Voltar para Workspace
        </button>
      </div>
    </div>
  )
}

