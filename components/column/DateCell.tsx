'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DateCellProps {
  value?: any
  onChange: (value: any) => void
}

export default function DateCell({ value, onChange }: DateCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  useEffect(() => {
    if (value?.start) setStartDate(new Date(value.start))
    if (value?.end) setEndDate(new Date(value.end))
  }, [value])

  const handleSave = () => {
    if (startDate || endDate) {
      onChange({
        start: startDate?.toISOString() || null,
        end: endDate?.toISOString() || null,
      })
    } else {
      onChange(null)
    }
    setIsOpen(false)
  }

  if (value?.start || value?.end) {
    const start = value.start ? format(new Date(value.start), 'MMM d', { locale: ptBR }) : ''
    const end = value.end ? format(new Date(value.end), 'MMM d', { locale: ptBR }) : ''
    const display = start && end ? `${start} - ${end}` : start || end

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left px-2 py-1 rounded text-sm bg-orange-100 text-orange-800 hover:bg-orange-200"
        >
          {display}
        </button>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 min-w-[300px]">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Data Início</label>
                <input
                  type="date"
                  value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Data Fim</label>
                <input
                  type="date"
                  value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-2 py-1 rounded text-sm text-gray-400 hover:bg-gray-100"
      >
        -
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 min-w-[300px]">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Data Início</label>
              <input
                type="date"
                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Data Fim</label>
              <input
                type="date"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Salvar
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

