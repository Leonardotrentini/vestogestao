'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ResizableColumnHeaderProps {
  column: {
    id: string
    name: string
    width?: number
    settings?: any
  }
  onResize: (columnId: string, width: number) => void
  onColumnNameChange?: () => void
  defaultWidth?: number
  currentWidth?: number
}

export default function ResizableColumnHeader({ 
  column, 
  onResize,
  onColumnNameChange,
  defaultWidth = 160,
  currentWidth
}: ResizableColumnHeaderProps) {
  const initialWidth = currentWidth || column.width || column.settings?.width || defaultWidth
  const [width, setWidth] = useState(initialWidth)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [isEditingName, setIsEditingName] = useState(false)
  const [columnName, setColumnName] = useState(column.name)
  const columnRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    setColumnName(column.name)
  }, [column.name])

  useEffect(() => {
    const savedWidth = currentWidth || column.width || column.settings?.width || defaultWidth
    setWidth(savedWidth)
  }, [column, defaultWidth, currentWidth])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    setResizeStartX(e.clientX)
    setResizeStartWidth(width)
    
    // Posição do tooltip
    if (columnRef.current) {
      const rect = columnRef.current.getBoundingClientRect()
      setTooltipPosition({
        x: rect.right,
        y: rect.top - 40
      })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const diff = e.clientX - resizeStartX
      const newWidth = Math.max(100, resizeStartWidth + diff) // Mínimo de 100px
      
      setWidth(newWidth)
      // Notificar o componente pai imediatamente para atualizar todas as células
      onResize(column.id, newWidth)
      
      // Atualizar posição do tooltip baseado na posição do mouse
      if (columnRef.current) {
        const rect = columnRef.current.getBoundingClientRect()
        setTooltipPosition({
          x: e.clientX,
          y: rect.top - 40
        })
      }
    }

    const handleMouseUp = async () => {
      if (!isResizing) return

      setIsResizing(false)
      
      // Salvar no banco de dados
      const newWidth = width
      
      // Salvar no settings da coluna
      const currentSettings = column.settings || {}
      const updatedSettings = {
        ...currentSettings,
        width: newWidth
      }

      await supabase
        .from('columns')
        .update({
          settings: updatedSettings
        })
        .eq('id', column.id)

      // Notificar o componente pai
      onResize(column.id, newWidth)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      // Mudar cursor
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, resizeStartX, resizeStartWidth, width, column.id, column.settings, onResize, tooltipPosition.y])

  return (
    <>
      <div
        ref={columnRef}
        className="relative flex-shrink-0 bg-[#1A2A1D] border-r border-[rgba(199,157,69,0.2)]"
        style={{ width: `${width}px`, minWidth: '100px' }}
      >
        <div className="px-3 py-2">
          {isEditingName ? (
            <input
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              onBlur={async () => {
                if (columnName.trim() && columnName.trim() !== column.name) {
                  await supabase
                    .from('columns')
                    .update({ name: columnName.trim() })
                    .eq('id', column.id)
                  
                  if (onColumnNameChange) {
                    onColumnNameChange()
                  }
                } else {
                  setColumnName(column.name)
                }
                setIsEditingName(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur()
                } else if (e.key === 'Escape') {
                  setColumnName(column.name)
                  setIsEditingName(false)
                }
              }}
              className="w-full px-2 py-0.5 border rounded text-xs font-semibold uppercase tracking-wide focus:outline-none focus:ring-1"
              style={{ 
                borderColor: '#C79D45',
                backgroundColor: 'rgba(26, 42, 29, 0.7)',
                color: 'rgba(255, 255, 255, 0.95)',
                '--tw-ring-color': '#C79D45'
              } as React.CSSProperties}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span 
              className="text-xs font-semibold text-[rgba(255,255,255,0.7)] uppercase tracking-wide cursor-pointer hover:text-[rgba(255,255,255,0.95)] transition-colors"
              onDoubleClick={(e) => {
                e.stopPropagation()
                setIsEditingName(true)
              }}
              title="Duplo clique para editar"
            >
              {column.name}
            </span>
          )}
        </div>
        
        {/* Handle de redimensionamento */}
        <div
          ref={resizeHandleRef}
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize transition-colors group z-10 ${
            isResizing ? 'bg-blue-500' : 'hover:bg-blue-500'
          }`}
          onMouseDown={handleMouseDown}
          title="Redimensionar coluna"
        >
          {isResizing && (
            <>
              {/* Linha azul vertical indicando o resize */}
              <div
                className="fixed top-0 bottom-0 w-0.5 bg-blue-500 z-[9998] pointer-events-none"
                style={{
                  left: `${tooltipPosition.x}px`,
                  transform: 'translateX(-50%)'
                }}
              />
            </>
          )}
        </div>

        {/* Tooltip durante o resize */}
        {isResizing && (
          <div
            className="fixed bg-[#1A2A1D] text-white text-xs px-3 py-1.5 rounded shadow-lg z-[9999] pointer-events-none border border-[rgba(199,157,69,0.3)]"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="relative">
              <span>Redimensionar Coluna</span>
              {/* Seta apontando para baixo */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-[#1A2A1D]" style={{ filter: 'drop-shadow(0 1px 0 rgba(199,157,69,0.3))' }}></div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

