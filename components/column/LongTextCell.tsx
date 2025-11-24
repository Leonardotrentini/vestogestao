'use client'

import { useState, useRef, useEffect } from 'react'
import { Edit2 } from 'lucide-react'

interface LongTextCellProps {
  value?: any
  onChange: (value: any) => void
}

export default function LongTextCell({ value, onChange }: LongTextCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    setIsEditing(false)
    onChange(inputValue.trim() || null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setInputValue(value || '')
  }

  if (isEditing) {
    return (
      <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 min-w-[300px] max-w-[500px]">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={4}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Digite o texto..."
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Salvar
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  if (value) {
    const displayText = value.length > 50 ? value.substring(0, 50) + '...' : value
    return (
      <div className="relative">
        <button
          onClick={() => setIsEditing(true)}
          className="w-full text-left px-2 py-1 rounded text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-1"
        >
          <span>{displayText}</span>
          <Edit2 size={12} className="text-gray-400" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsEditing(true)}
        className="w-full text-left px-2 py-1 rounded text-sm text-gray-400 hover:bg-gray-100 flex items-center gap-1"
      >
        <span>-</span>
        <Edit2 size={12} />
      </button>
    </div>
  )
}

