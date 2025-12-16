'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const PRIORITY_OPTIONS = [
  { value: 'baixa', label: 'Baixa', color: 'bg-green-200 text-green-800' },
  { value: 'media', label: 'Média', color: 'bg-yellow-200 text-yellow-800' },
  { value: 'alta', label: 'Alta', color: 'bg-red-200 text-red-800' },
  { value: 'cliente', label: 'Cliente', color: 'bg-gray-200 text-gray-800' },
]

interface PriorityCellProps {
  value?: any
  onChange: (value: any) => void
}

export default function PriorityCell({ value, onChange }: PriorityCellProps) {
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

  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === value) || PRIORITY_OPTIONS[3]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left px-2 py-1 rounded text-sm font-medium ${selectedPriority.color} flex items-center justify-between`}
      >
        <span>{selectedPriority.label}</span>
        <ChevronDown size={14} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[90]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-[100] mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[150px]">
            {PRIORITY_OPTIONS.map((priority) => (
              <button
                key={priority.value}
                onClick={() => {
                  onChange(priority.value)
                  setIsOpen(false)
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
              >
                <span className={`inline-block px-2 py-1 rounded text-xs ${priority.color}`}>
                  {priority.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}









