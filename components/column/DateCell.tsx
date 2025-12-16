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
          className="w-full text-left px-2 py-1 rounded text-sm bg-[rgba(199,157,69,0.15)] text-[#C79D45] hover:bg-[rgba(199,157,69,0.25)]"
        >
          {display}
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[90]" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-[100] mt-1 bg-white border border-[rgba(199,157,69,0.3)] rounded-md shadow-lg p-4 min-w-[300px]">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#0F1711] mb-1">Data Início</label>
                <input
                  type="date"
                  value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-2 py-1 border border-[rgba(199,157,69,0.3)] bg-white text-[#0F1711] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#C79D45]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#0F1711] mb-1">Data Fim</label>
                <input
                  type="date"
                  value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-2 py-1 border border-[rgba(199,157,69,0.3)] bg-white text-[#0F1711] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#C79D45]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] px-3 py-1 rounded text-sm font-semibold hover:from-[#D4AD5F] hover:to-[#E5C485] transition-all"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-[rgba(0,0,0,0.2)] text-[rgba(255,255,255,0.7)] px-3 py-1 rounded text-sm hover:bg-[rgba(0,0,0,0.3)] hover:text-[rgba(255,255,255,0.95)]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-2 py-1 rounded text-sm text-[rgba(255,255,255,0.7)] hover:bg-[rgba(199,157,69,0.1)] hover:text-[rgba(255,255,255,0.95)]"
      >
        -
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[90]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-[100] mt-1 bg-white border border-[rgba(199,157,69,0.3)] rounded-md shadow-lg p-4 min-w-[300px]">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#0F1711] mb-1">Data Início</label>
                <input
                  type="date"
                  value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-2 py-1 border border-[rgba(199,157,69,0.3)] bg-white text-[#0F1711] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#C79D45]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#0F1711] mb-1">Data Fim</label>
                <input
                  type="date"
                  value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-2 py-1 border border-[rgba(199,157,69,0.3)] bg-white text-[#0F1711] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#C79D45]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] px-3 py-1 rounded text-sm font-semibold hover:from-[#D4AD5F] hover:to-[#E5C485] transition-all"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-[rgba(0,0,0,0.2)] text-[rgba(255,255,255,0.7)] px-3 py-1 rounded text-sm hover:bg-[rgba(0,0,0,0.3)] hover:text-[rgba(255,255,255,0.95)]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

