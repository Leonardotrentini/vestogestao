'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

interface BoardHeaderProps {
  boardId: string
  workspaceId: string
  onCreateGroup: (name: string) => void
}

export default function BoardHeader({ workspaceId, onCreateGroup }: BoardHeaderProps) {
  const [showGroupInput, setShowGroupInput] = useState(false)
  const [groupName, setGroupName] = useState('')
  const router = useRouter()

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (groupName.trim()) {
      onCreateGroup(groupName.trim())
      setGroupName('')
      setShowGroupInput(false)
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/workspaces/${workspaceId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Quadro</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!showGroupInput ? (
          <button
            onClick={() => setShowGroupInput(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Criar grupo
          </button>
        ) : (
          <form onSubmit={handleCreateGroup} className="flex items-center gap-2">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nome do grupo"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Criar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowGroupInput(false)
                setGroupName('')
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

