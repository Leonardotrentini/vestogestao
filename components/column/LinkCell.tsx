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
        className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1"
        style={{ 
          borderColor: '#C79D45',
          backgroundColor: 'rgba(26, 42, 29, 0.7)',
          color: 'rgba(255, 255, 255, 0.95)',
          '--tw-ring-color': '#C79D45'
        } as React.CSSProperties}
        placeholder="https://..."
      />
    )
  }

  if (value) {
    return (
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-1 px-2 py-1 rounded text-sm text-[#C79D45] hover:bg-[rgba(199,157,69,0.1)] hover:text-[#D4AD5F]"
      >
        <span className="truncate">{value.length > 20 ? value.substring(0, 20) + '...' : value}</span>
        <ExternalLink size={12} />
      </button>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full text-left px-2 py-1 rounded text-sm text-[rgba(255,255,255,0.7)] hover:bg-[rgba(199,157,69,0.1)] hover:text-[rgba(255,255,255,0.95)]"
    >
      -
    </button>
  )
}

