'use client'

import { useState, useRef, useEffect } from 'react'

interface NumberCellProps {
  value?: any
  onChange: (value: any) => void
}

export default function NumberCell({ value, onChange }: NumberCellProps) {
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
      const numValue = parseFloat(inputValue)
      onChange(isNaN(numValue) ? null : numValue)
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

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
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
        placeholder="0"
      />
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full text-left px-2 py-1 rounded text-sm text-[rgba(255,255,255,0.95)] hover:bg-[rgba(199,157,69,0.1)]"
    >
      {value !== null && value !== undefined ? value : '-'}
    </button>
  )
}

