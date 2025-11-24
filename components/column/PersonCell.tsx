'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/supabase/migrations/types'
import { ChevronDown } from 'lucide-react'

interface PersonCellProps {
  value?: any
  onChange: (value: any) => void
}

export default function PersonCell({ value, onChange }: PersonCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

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
    // Sem autenticação, usamos um usuário padrão
    const { getDefaultUserId } = await import('@/lib/utils')
    const defaultUserId = getDefaultUserId()
    setUsers([{ id: defaultUserId, email: 'usuario@interno.com' }])
  }

  const selectedUser = users.find(u => u.id === value)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-2 py-1 rounded text-sm flex items-center justify-between hover:bg-gray-100"
      >
        {selectedUser ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
              {selectedUser.email.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-700">{selectedUser.email.split('@')[0]}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
        <ChevronDown size={14} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px]">
          <button
            onClick={() => {
              onChange(null)
              setIsOpen(false)
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-400"
          >
            Nenhum
          </button>
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onChange(user.id)
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span>{user.email.split('@')[0]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

