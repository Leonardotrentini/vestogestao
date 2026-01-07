'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/supabase/migrations/types'
import { ChevronDown, X } from 'lucide-react'

interface PersonCellProps {
  value?: any
  onChange: (value: any) => void
  itemId?: string
  boardId?: string
  itemName?: string
}

export default function PersonCell({ value, onChange, itemId, boardId, itemName }: PersonCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  // Normalizar value para array
  useEffect(() => {
    if (value === null || value === undefined || value === '') {
      setSelectedUserIds([])
    } else if (Array.isArray(value)) {
      setSelectedUserIds(value)
    } else if (typeof value === 'string') {
      // Se for string única, converter para array
      setSelectedUserIds([value])
    } else {
      setSelectedUserIds([])
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadUsers = async () => {
    try {
      // Buscar usuários via API route
      const response = await fetch('/api/users')
      const usersData: User[] = await response.json()
      setUsers(usersData)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      // Fallback: usar usuário padrão
      const { getDefaultUserId } = await import('@/lib/utils')
      const defaultUserId = getDefaultUserId()
      setUsers([{ id: defaultUserId, email: 'usuario@interno.com' }])
    }
  }

  const handleUserToggle = async (userId: string) => {
    const newSelectedIds = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId]
    
    setSelectedUserIds(newSelectedIds)
    onChange(newSelectedIds.length > 0 ? newSelectedIds : null)

    // Criar notificação se um novo usuário foi atribuído
    if (!selectedUserIds.includes(userId) && itemId && itemName) {
      const { notifyUserAssignment } = await import('@/lib/notifications')
      await notifyUserAssignment(userId, itemId, itemName, boardId)
    }
  }

  const handleRemoveUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelectedIds = selectedUserIds.filter(id => id !== userId)
    setSelectedUserIds(newSelectedIds)
    onChange(newSelectedIds.length > 0 ? newSelectedIds : null)
  }

  const selectedUsers = users.filter(u => selectedUserIds.includes(u.id))

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-2 py-1 rounded text-sm flex items-center justify-between hover:bg-[rgba(199,157,69,0.1)] transition-colors min-h-[32px]"
      >
        {selectedUsers.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-1 bg-[rgba(199,157,69,0.15)] rounded-full px-2 py-0.5 group/person"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-5 h-5 rounded-full bg-[#C79D45] flex items-center justify-center text-[#0F1711] text-[10px] font-semibold flex-shrink-0">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-[rgba(255,255,255,0.95)] text-xs">{user.name || user.email.split('@')[0]}</span>
                <button
                  onClick={(e) => handleRemoveUser(user.id, e)}
                  className="opacity-0 group-hover/person:opacity-100 ml-0.5 p-0.5 hover:bg-[rgba(0,0,0,0.2)] rounded transition-opacity"
                  title="Remover"
                >
                  <X size={12} className="text-[rgba(255,255,255,0.7)]" />
                </button>
              </div>
            ))}
            {selectedUsers.length > 2 && (
              <span className="text-[rgba(255,255,255,0.7)] text-xs">+{selectedUsers.length - 2}</span>
            )}
          </div>
        ) : (
          <span className="text-[rgba(255,255,255,0.7)]">-</span>
        )}
        <ChevronDown size={14} className="flex-shrink-0 ml-2" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[90]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-[100] mt-1 bg-[#1A2A1D] border border-[rgba(199,157,69,0.3)] rounded-md shadow-lg min-w-[250px] max-h-[300px] overflow-y-auto">
          {selectedUserIds.length > 0 && (
            <button
              onClick={() => {
                setSelectedUserIds([])
                onChange(null)
              }}
              className="w-full text-left px-3 py-2 hover:bg-[rgba(199,157,69,0.1)] text-sm text-[rgba(255,255,255,0.7)] transition-colors border-b border-[rgba(199,157,69,0.2)]"
            >
              Limpar todos
            </button>
          )}
          {users.map((user) => {
            const isSelected = selectedUserIds.includes(user.id)
            return (
              <button
                key={user.id}
                onClick={() => handleUserToggle(user.id)}
                className={`w-full text-left px-3 py-2 hover:bg-[rgba(199,157,69,0.1)] text-sm flex items-center gap-2 transition-colors ${
                  isSelected ? 'bg-[rgba(199,157,69,0.15)]' : ''
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected 
                    ? 'bg-[#C79D45] border-[#C79D45]' 
                    : 'border-[rgba(199,157,69,0.3)]'
                }`}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[#0F1711]"></div>
                  )}
                </div>
                <div className="w-6 h-6 rounded-full bg-[#C79D45] flex items-center justify-center text-[#0F1711] text-xs font-semibold flex-shrink-0">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-[rgba(255,255,255,0.95)]">{user.name || user.email.split('@')[0]}</span>
              </button>
            )
          })}
          </div>
        </>
      )}
    </div>
  )
}

