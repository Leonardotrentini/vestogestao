'use client'

import { useState, useEffect, useRef } from 'react'
import { Column } from '@/supabase/migrations/types'
import StatusCell from './StatusCell'
import PersonCell from './PersonCell'
import PriorityCell from './PriorityCell'
import DateCell from './DateCell'
import TimeTrackingCell from './TimeTrackingCell'
import CurrencyCell from './CurrencyCell'
import LinkCell from './LinkCell'
import LongTextCell from './LongTextCell'
import NumberCell from './NumberCell'

interface ColumnCellProps {
  column: Column
  value: any
  itemId: string
  onChange: (value: any) => void
  boardId?: string
}

export default function ColumnCell({ column, value, itemId, onChange, boardId }: ColumnCellProps) {
  switch (column.type) {
    case 'status':
      return <StatusCell value={value} onChange={onChange} column={column} boardId={boardId} />
    case 'person':
      return <PersonCell value={value} onChange={onChange} />
    case 'priority':
      return <PriorityCell value={value} onChange={onChange} />
    case 'date':
      return <DateCell value={value} onChange={onChange} />
    case 'time_tracking':
      return <TimeTrackingCell itemId={itemId} value={value} onChange={onChange} />
    case 'currency':
      return <CurrencyCell value={value} onChange={onChange} />
    case 'link':
      return <LinkCell value={value} onChange={onChange} />
    case 'long_text':
      return <LongTextCell value={value} onChange={onChange} />
    case 'number':
      return <NumberCell value={value} onChange={onChange} />
    case 'text':
      return (
        <EditableTextCell value={value} onChange={onChange} />
      )
    default:
      return (
        <EditableTextCell value={value} onChange={onChange} />
      )
  }
}

// Componente para texto editável inline
function EditableTextCell({ value, onChange }: { value: any, onChange: (value: any) => void }) {
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
    onChange(inputValue.trim() || null)
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
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
      />
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full text-left px-2 py-1 rounded text-sm text-gray-700 hover:bg-gray-100"
    >
      {value || '-'}
    </button>
  )
}

