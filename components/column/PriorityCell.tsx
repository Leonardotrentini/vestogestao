'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      // Calcular posição do dropdown quando abrir (fixed positioning usa viewport coordinates)
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left
        })
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === value) || PRIORITY_OPTIONS[3]

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left px-2 py-1 rounded text-sm font-medium ${selectedPriority.color} flex items-center justify-between`}
      >
        <span>{selectedPriority.label}</span>
        <ChevronDown size={14} />
      </button>
      
      {isOpen && mounted && typeof window !== 'undefined' && typeof document !== 'undefined' && document.body ? createPortal(
        <>
          <div 
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)}
            style={{ 
              pointerEvents: 'auto',
              zIndex: 99998
            }}
          />
          <div 
            ref={dropdownRef}
            className="fixed bg-white border border-gray-300 rounded-lg shadow-2xl min-w-[150px] w-max"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              zIndex: 99999,
              position: 'fixed',
              isolation: 'isolate'
            }}
          >
            {/* Arrow pointing up */}
            <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-300 transform rotate-45" />
            
            {/* Content */}
            <div className="relative bg-white rounded-lg overflow-hidden">
              <div className="py-2">
                {PRIORITY_OPTIONS.map((priority) => (
                  <button
                    key={priority.value}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onChange(priority.value)
                      setIsOpen(false)
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <span className={`inline-block px-3 py-1.5 rounded-md text-sm font-medium ${priority.color}`}>
                      {priority.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>,
        document.body
      ) : null}
    </div>
  )
}









