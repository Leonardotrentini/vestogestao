'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Edit2 } from 'lucide-react'

interface WorkspaceCardProps {
  workspace: {
    id: string
    name: string
    description?: string | null
  }
}

export default function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [workspaceName, setWorkspaceName] = useState(workspace.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setWorkspaceName(workspace.name)
  }, [workspace.name])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleUpdate = async () => {
    if (workspaceName.trim() && workspaceName !== workspace.name) {
      await supabase
        .from('workspaces')
        .update({ name: workspaceName.trim() })
        .eq('id', workspace.id)
      
      router.refresh()
    } else {
      setWorkspaceName(workspace.name)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate()
    } else if (e.key === 'Escape') {
      setWorkspaceName(workspace.name)
      setIsEditing(false)
    }
  }

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow group/card relative cursor-pointer"
      onClick={() => {
        if (!isEditing) {
          window.location.href = `/workspaces/${workspace.id}`
        }
      }}
    >
      <div className="flex items-start justify-between mb-2">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            onBlur={handleUpdate}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 border border-blue-500 rounded text-xl font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <h3 className="text-xl font-semibold text-gray-900 flex-1">
              {workspace.name}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setIsEditing(true)
              }}
              className="opacity-0 group-hover/card:opacity-100 p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-opacity"
              title="Editar nome"
            >
              <Edit2 size={18} />
            </button>
          </div>
        )}
      </div>
      {workspace.description && (
        <p className="text-gray-600 text-sm">{workspace.description}</p>
      )}
    </div>
  )
}

