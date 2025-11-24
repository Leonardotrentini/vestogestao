'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/supabase/migrations/types'
import { ChevronDown } from 'lucide-react'

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
  const [previousValue, setPreviousValue] = useState(value)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    setPreviousValue(value)
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

  const handleUserChange = async (newUserId: string | null) => {
    onChange(newUserId)
    setIsOpen(false)

    // Criar notificação se um novo usuário foi atribuído
    if (newUserId && newUserId !== previousValue && itemId && itemName) {
      const { notifyUserAssignment } = await import('@/lib/notifications')
      await notifyUserAssignment(newUserId, itemId, itemName, boardId)
    }
  }

  const selectedUser = users.find(u => u.id === value)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-2 py-1 rounded text-sm flex items-center justify-between hover:bg-[rgba(199,157,69,0.1)] transition-colors"
      >
        {selectedUser ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#C79D45] flex items-center justify-center text-[#0F1711] text-xs font-semibold">
              {(selectedUser.name || selectedUser.email).charAt(0).toUpperCase()}
            </div>
            <span className="text-[rgba(255,255,255,0.95)]">{selectedUser.name || selectedUser.email.split('@')[0]}</span>
          </div>
        ) : (
          <span className="text-[rgba(255,255,255,0.7)]">-</span>
        )}
        <ChevronDown size={14} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-[#1A2A1D] border border-[rgba(199,157,69,0.3)] rounded-md shadow-lg min-w-[200px] max-h-[300px] overflow-y-auto">
          <button
            onClick={() => handleUserChange(null)}
            className="w-full text-left px-3 py-2 hover:bg-[rgba(199,157,69,0.1)] text-sm text-[rgba(255,255,255,0.7)] transition-colors"
          >
            Nenhum
          </button>
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserChange(user.id)}
              className="w-full text-left px-3 py-2 hover:bg-[rgba(199,157,69,0.1)] text-sm flex items-center gap-2 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#C79D45] flex items-center justify-center text-[#0F1711] text-xs font-semibold">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <span className="text-[rgba(255,255,255,0.95)]">{user.name || user.email.split('@')[0]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

