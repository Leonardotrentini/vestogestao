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
      <div className="absolute z-50 mt-1 bg-white border border-[rgba(199,157,69,0.3)] rounded-md shadow-lg p-3 min-w-[300px] max-w-[500px]">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={4}
          className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1"
          style={{ 
            borderColor: '#C79D45',
            backgroundColor: 'rgba(26, 42, 29, 0.7)',
            color: 'rgba(255, 255, 255, 0.95)',
            '--tw-ring-color': '#C79D45'
          } as React.CSSProperties}
          placeholder="Digite o texto..."
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] px-3 py-1 rounded text-sm font-semibold hover:from-[#D4AD5F] hover:to-[#E5C485] transition-all"
          >
            Salvar
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-[rgba(0,0,0,0.2)] text-[rgba(255,255,255,0.7)] px-3 py-1 rounded text-sm hover:bg-[rgba(0,0,0,0.3)] hover:text-[rgba(255,255,255,0.95)]"
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
          className="w-full text-left px-2 py-1 rounded text-sm text-[rgba(255,255,255,0.95)] hover:bg-[rgba(199,157,69,0.1)] flex items-center gap-1"
        >
          <span>{displayText}</span>
          <Edit2 size={12} className="text-[rgba(255,255,255,0.7)]" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsEditing(true)}
        className="w-full text-left px-2 py-1 rounded text-sm text-[rgba(255,255,255,0.7)] hover:bg-[rgba(199,157,69,0.1)] hover:text-[rgba(255,255,255,0.95)] flex items-center gap-1"
      >
        <span>-</span>
        <Edit2 size={12} />
      </button>
    </div>
  )
}

