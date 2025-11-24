'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/supabase/migrations/types'

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  onMention?: (userId: string, userName: string) => void
  itemId?: string
  boardId?: string
  itemName?: string
}

export default function MentionInput({
  value,
  onChange,
  placeholder = '',
  rows = 4,
  onMention,
  itemId,
  boardId,
  itemName,
}: MentionInputProps) {
  const [users, setUsers] = useState<User[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mentionsListRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = newValue.substring(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      // Verificar se não há espaço após o @
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt.toLowerCase())
        setMentionPosition({ start: lastAtIndex, end: cursorPosition })
        setShowMentions(true)
        return
      }
    }

    setShowMentions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && mentionsListRef.current) {
      const selected = mentionsListRef.current.querySelector('[data-selected="true"]') as HTMLElement
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = selected?.nextElementSibling || mentionsListRef.current.firstElementChild
        if (next) {
          selected?.setAttribute('data-selected', 'false')
          next.setAttribute('data-selected', 'true')
          next.scrollIntoView({ block: 'nearest' })
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = selected?.previousElementSibling || mentionsListRef.current.lastElementChild
        if (prev) {
          selected?.setAttribute('data-selected', 'false')
          prev.setAttribute('data-selected', 'true')
          prev.scrollIntoView({ block: 'nearest' })
        }
      } else if (e.key === 'Enter' && selected) {
        e.preventDefault()
        const userId = selected.getAttribute('data-user-id')
        const userName = selected.getAttribute('data-user-name')
        if (userId && userName) {
          insertMention(userId, userName)
        }
      } else if (e.key === 'Escape') {
        setShowMentions(false)
      }
    }
  }

  const insertMention = (userId: string, userName: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const text = value
    const beforeMention = text.substring(0, mentionPosition.start)
    const afterMention = text.substring(mentionPosition.end)
    const newText = `${beforeMention}@${userName} ${afterMention}`

    onChange(newText)
    setShowMentions(false)

    // Criar notificação de menção
    if (onMention && itemId && itemName) {
      onMention(userId, userName)
    }

    // Reposicionar cursor após a menção
    setTimeout(() => {
      const newCursorPos = beforeMention.length + userName.length + 2 // +2 para @ e espaço
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  const filteredUsers = users.filter(user => {
    const email = user.email.toLowerCase()
    const name = (user.name || '').toLowerCase()
    const query = mentionQuery.toLowerCase()
    return email.includes(query) || name.includes(query)
  })

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C79D45] resize-none"
        style={{
          borderColor: 'rgba(199, 157, 69, 0.3)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          color: 'rgba(255, 255, 255, 0.95)'
        } as React.CSSProperties}
      />
      
      {showMentions && filteredUsers.length > 0 && (
        <div
          ref={mentionsListRef}
          className="absolute z-50 mt-1 bg-[#1A2A1D] border border-[rgba(199,157,69,0.3)] rounded-md shadow-lg max-h-[200px] overflow-y-auto min-w-[200px]"
        >
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              data-user-id={user.id}
              data-user-name={user.email.split('@')[0]}
              data-selected={index === 0 ? 'true' : 'false'}
              onClick={() => insertMention(user.id, user.email.split('@')[0])}
              className="w-full text-left px-3 py-2 hover:bg-[rgba(199,157,69,0.1)] text-sm flex items-center gap-2 transition-colors data-[selected=true]:bg-[rgba(199,157,69,0.2)]"
            >
              <div className="w-6 h-6 rounded-full bg-[#C79D45] flex items-center justify-center text-[#0F1711] text-xs font-semibold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span className="text-[rgba(255,255,255,0.95)]">{user.email.split('@')[0]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

