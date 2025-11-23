'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'aguardo', label: 'AGUARDO', color: 'bg-orange-200 text-orange-800' },
  { value: 'aguardando_aprovacao', label: 'Aguardando apr...', color: 'bg-purple-200 text-purple-800' },
  { value: 'em_progresso', label: 'Em progresso', color: 'bg-blue-200 text-blue-800' },
  { value: 'finalizado', label: 'Finalizado', color: 'bg-green-200 text-green-800' },
]

interface StatusCellProps {
  value?: any
  onChange: (value: any) => void
}

export default function StatusCell({ value, onChange }: StatusCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedStatus = STATUS_OPTIONS.find(s => s.value === value) || STATUS_OPTIONS[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left px-2 py-1 rounded text-sm font-medium ${selectedStatus.color} flex items-center justify-between`}
      >
        <span>{selectedStatus.label}</span>
        <ChevronDown size={14} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px]">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status.value}
              onClick={() => {
                onChange(status.value)
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
            >
              <span className={`inline-block px-2 py-1 rounded text-xs ${status.color}`}>
                {status.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

