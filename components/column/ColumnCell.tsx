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
import { formatPhoneNumber, isPhoneNumber } from '@/lib/phone-utils'

interface ColumnCellProps {
  column: Column
  value: any
  itemId: string
  onChange: (value: any) => void
  boardId?: string
  itemName?: string
}

export default function ColumnCell({ column, value, itemId, onChange, boardId, itemName }: ColumnCellProps) {
  switch (column.type) {
    case 'status':
      return <StatusCell value={value} onChange={onChange} column={column} boardId={boardId} />
    case 'person':
      return <PersonCell value={value} onChange={onChange} itemId={itemId} boardId={boardId} itemName={itemName} />
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
        <EditableTextCell value={value} onChange={onChange} column={column} />
      )
    default:
      return (
        <EditableTextCell value={value} onChange={onChange} column={column} />
      )
  }
}

// Componente para texto editável inline
function EditableTextCell({ value, onChange, column }: { value: any, onChange: (value: any) => void, column?: Column }) {
  // Verificar se é uma coluna de WhatsApp ou se o valor parece ser um telefone
  const isWhatsAppColumn = column?.name?.toLowerCase().includes('whatsapp') || column?.name?.toLowerCase().includes('wpp')
  const shouldFormatPhone = isWhatsAppColumn || (value && isPhoneNumber(value))
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
    // Se for telefone, salvar sem formatação (apenas números)
    if (shouldFormatPhone && inputValue) {
      const cleaned = inputValue.replace(/\D/g, '')
      onChange(cleaned || null)
    } else {
      onChange(inputValue.trim() || null)
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
      />
    )
  }

  // Formatar o valor se for telefone
  const displayValue = shouldFormatPhone && value ? formatPhoneNumber(value) : (value || '-')

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full text-left px-2 py-1.5 rounded-md text-sm text-[rgba(255,255,255,0.95)] hover:bg-[rgba(199,157,69,0.12)] hover:border hover:border-[rgba(199,157,69,0.3)] transition-all duration-150"
    >
      {displayValue}
    </button>
  )
}

