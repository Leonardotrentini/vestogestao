'use client'

import { useState, useRef, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'

interface LinkCellProps {
  value?: any
  onChange: (value: any) => void
}

export default function LinkCell({ value, onChange }: LinkCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    if (inputValue.trim()) {
      onChange(inputValue.trim())
    } else {
      onChange(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setInputValue(value || '')
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (value && !isEditing) {
      e.stopPropagation()
      window.open(value, '_blank')
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
        placeholder="https://..."
      />
    )
  }

  if (value) {
    return (
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-1 px-2 py-1 rounded text-sm text-blue-600 hover:bg-blue-50"
      >
        <span className="truncate">{value.length > 20 ? value.substring(0, 20) + '...' : value}</span>
        <ExternalLink size={12} />
      </button>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full text-left px-2 py-1 rounded text-sm text-gray-400 hover:bg-gray-100"
    >
      -
    </button>
  )
}

