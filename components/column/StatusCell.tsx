'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Edit2, Plus } from 'lucide-react'
import { Column } from '@/supabase/migrations/types'
import StatusLabelManager from './StatusLabelManager'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_STATUS_OPTIONS = [
  { value: 'aguardo', label: 'AGUARDO', color: 'bg-orange-200 text-orange-800' },
  { value: 'aguardando_aprovacao', label: 'Aguardando apr...', color: 'bg-purple-200 text-purple-800' },
  { value: 'a_iniciar', label: 'A iniciar', color: 'bg-blue-200 text-blue-800' },
  { value: 'em_progresso', label: 'Em progresso', color: 'bg-orange-200 text-orange-800' },
  { value: 'finalizado', label: 'Finalizado', color: 'bg-green-200 text-green-800' },
  { value: 'faturando', label: 'Faturando', color: 'bg-green-200 text-green-800' },
  { value: 'precisa_atencao', label: 'Precisa de Atenção', color: 'bg-gray-200 text-gray-800' },
  { value: 'planejamento', label: 'Planejamento', color: 'bg-blue-200 text-blue-800' },
  { value: 'upado_drive', label: 'Upado no Drive', color: 'bg-pink-200 text-pink-800' },
  { value: 'parado', label: 'Parado', color: 'bg-red-200 text-red-800' },
  { value: 'frio', label: 'FRIO', color: 'bg-gray-200 text-gray-800' },
  { value: 'agendado', label: 'AGENDADO', color: 'bg-yellow-200 text-yellow-800' },
  { value: 'negociando', label: 'NEGOCIAN', color: 'bg-green-200 text-green-800' },
  { value: 'fim_cadencia', label: 'FIM DE CAD.', color: 'bg-red-200 text-red-800' },
]

interface StatusCellProps {
  value?: any
  onChange: (value: any) => void
  column?: Column
  boardId?: string
  onColumnsReload?: () => void
}

const COLOR_OPTIONS = [
  { value: 'bg-blue-200 text-blue-800', label: 'Azul' },
  { value: 'bg-green-200 text-green-800', label: 'Verde' },
  { value: 'bg-orange-200 text-orange-800', label: 'Laranja' },
  { value: 'bg-red-200 text-red-800', label: 'Vermelho' },
  { value: 'bg-purple-200 text-purple-800', label: 'Roxo' },
  { value: 'bg-pink-200 text-pink-800', label: 'Rosa' },
  { value: 'bg-yellow-200 text-yellow-800', label: 'Amarelo' },
  { value: 'bg-indigo-200 text-indigo-800', label: 'Índigo' },
  { value: 'bg-gray-200 text-gray-800', label: 'Cinza' },
]

export default function StatusCell({ value, onChange, column, boardId, onColumnsReload }: StatusCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showLabelManager, setShowLabelManager] = useState(false)
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [editingLabelName, setEditingLabelName] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(COLOR_OPTIONS[0].value)
  const [statusOptions, setStatusOptions] = useState<Array<{ value: string; label: string; color: string }>>(DEFAULT_STATUS_OPTIONS)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const newLabelInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Função helper para obter opções padrão
  const getDefaultOptions = (col?: Column): Array<{ value: string; label: string; color: string }> => {
    if (!col) return DEFAULT_STATUS_OPTIONS
    
    if (col.name === 'Status do cliente') {
      return [
        { value: 'faturando', label: 'Faturando', color: 'bg-green-200 text-green-800' },
        { value: 'em_progresso', label: 'Em progresso', color: 'bg-orange-200 text-orange-800' },
        { value: 'precisa_atencao', label: 'Precisa de Atenção', color: 'bg-gray-200 text-gray-800' },
      ]
    } else if (col.name === 'Status' && col.board_id) {
      return [
        { value: 'planejamento', label: 'Planejamento', color: 'bg-blue-200 text-blue-800' },
        { value: 'em_progresso', label: 'Em progresso', color: 'bg-orange-200 text-orange-800' },
        { value: 'upado_drive', label: 'Upado no Drive', color: 'bg-pink-200 text-pink-800' },
        { value: 'parado', label: 'Parado', color: 'bg-red-200 text-red-800' },
      ]
    }
    
    return DEFAULT_STATUS_OPTIONS
  }

  const loadStatusOptions = () => {
    if (!column) {
      setStatusOptions(DEFAULT_STATUS_OPTIONS)
      return
    }

    // Carregar opções do settings da coluna, ou usar padrões
    if (column.settings && typeof column.settings === 'object') {
      const settings = column.settings as any
      if (settings.options && Array.isArray(settings.options) && settings.options.length > 0) {
        setStatusOptions(settings.options)
        return
      }
    }
    
    // Usar opções padrão baseadas no nome da coluna
    const options = getDefaultOptions(column)
    setStatusOptions(options)
  }

  useEffect(() => {
    loadStatusOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [column])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedStatus = statusOptions.length > 0 
    ? (statusOptions.find(s => s.value === value) || statusOptions[0])
    : { value: '', label: '-', color: 'bg-gray-200 text-gray-800' }

  const handleUpdateLabels = () => {
    loadStatusOptions()
  }

  const handleStartEditLabel = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingLabelName(selectedStatus.label)
    setIsEditingLabel(true)
    setIsOpen(false)
  }

  const handleSaveLabelEdit = async () => {
    if (!column || !editingLabelName.trim() || editingLabelName === selectedStatus.label) {
      setIsEditingLabel(false)
      return
    }

    // Atualizar a etiqueta nos settings da coluna
    const currentSettings = (column.settings && typeof column.settings === 'object') 
      ? (column.settings as any) 
      : { options: statusOptions }

    const updatedOptions = statusOptions.map(opt => 
      opt.value === selectedStatus.value 
        ? { ...opt, label: editingLabelName.trim() }
        : opt
    )

    await supabase
      .from('columns')
      .update({
        settings: { options: updatedOptions }
      })
      .eq('id', column.id)

    // Recarregar opções
    loadStatusOptions()
    
    if (onColumnsReload) {
      onColumnsReload()
    } else {
      window.location.reload()
    }

    setIsEditingLabel(false)
  }

  const handleCancelEditLabel = () => {
    setIsEditingLabel(false)
    setEditingLabelName('')
  }

  useEffect(() => {
    if (isEditingLabel && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [isEditingLabel])

  useEffect(() => {
    if (isAddingNew && newLabelInputRef.current) {
      newLabelInputRef.current.focus()
    }
  }, [isAddingNew])

  const handleAddNewLabel = async () => {
    if (!column || !newLabelName.trim()) return

    const newValue = newLabelName.trim().toLowerCase().replace(/\s+/g, '_')
    
    // Verificar se já existe
    if (statusOptions.find(opt => opt.value === newValue)) {
      alert('Já existe uma etiqueta com esse nome!')
      return
    }

    // Atualizar opções localmente primeiro
    const newOption = {
      value: newValue,
      label: newLabelName.trim(),
      color: newLabelColor
    }

    const updatedOptions = [...statusOptions, newOption]

    // Salvar no banco
    await supabase
      .from('columns')
      .update({
        settings: { options: updatedOptions }
      })
      .eq('id', column.id)

    // Selecionar a nova etiqueta automaticamente
    onChange(newValue)

    // Resetar estado
    setNewLabelName('')
    setNewLabelColor(COLOR_OPTIONS[0].value)
    setIsAddingNew(false)

    // Recarregar opções
    loadStatusOptions()

    if (onColumnsReload) {
      onColumnsReload()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="relative w-full group/status" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      {isEditingLabel ? (
        <div className="flex items-center gap-1">
          <input
            ref={editInputRef}
            type="text"
            value={editingLabelName}
            onChange={(e) => setEditingLabelName(e.target.value)}
            onBlur={handleSaveLabelEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveLabelEdit()
              } else if (e.key === 'Escape') {
                handleCancelEditLabel()
              }
            }}
            className="flex-1 px-2 py-1 rounded text-sm font-medium border-2 focus:outline-none focus:ring-1"
            style={{ 
              borderColor: '#C79D45',
              backgroundColor: 'rgba(26, 42, 29, 0.7)',
              color: 'rgba(255, 255, 255, 0.95)',
              '--tw-ring-color': '#C79D45'
            } as React.CSSProperties}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
          className={`w-full text-left px-2 py-1 rounded text-sm font-medium ${selectedStatus.color} flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity group/button`}
        >
          <span className="flex-1">{selectedStatus.label}</span>
          <div className="flex items-center gap-1">
            {column && (
              <button
                onClick={handleStartEditLabel}
                className="opacity-0 group-hover/status:opacity-100 p-0.5 hover:bg-black hover:bg-opacity-10 rounded transition-opacity"
                title="Editar nome da etiqueta"
              >
                <Edit2 size={12} />
              </button>
            )}
            <ChevronDown size={14} />
          </div>
        </button>
      )}
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[90]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-[100] mt-2 bg-white border border-gray-300 rounded-lg shadow-xl min-w-[280px] w-max max-w-[400px]">
            {/* Arrow pointing up */}
            <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-300 transform rotate-45" />
            
            {/* Content */}
            <div className="relative bg-white rounded-lg overflow-hidden">
              {/* Status Options */}
              <div className="py-2 max-h-[400px] overflow-y-auto">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onChange(status.value)
                      setIsOpen(false)
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <span className={`inline-block px-3 py-1.5 rounded-md text-sm font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Form to add new */}
              {isAddingNew && column ? (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <div className="space-y-2">
                    <input
                      ref={newLabelInputRef}
                      type="text"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      placeholder="Nome da etiqueta"
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 placeholder:text-gray-400"
                      style={{ 
                        borderColor: 'rgba(199, 157, 69, 0.3)',
                        backgroundColor: 'rgba(26, 42, 29, 0.7)',
                        color: 'rgba(255, 255, 255, 0.95)',
                        '--tw-ring-color': '#C79D45'
                      } as React.CSSProperties}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddNewLabel()
                        } else if (e.key === 'Escape') {
                          setIsAddingNew(false)
                          setNewLabelName('')
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <select
                      value={newLabelColor}
                      onChange={(e) => setNewLabelColor(e.target.value)}
                      className="w-full px-3 py-2 border border-[rgba(199,157,69,0.3)] bg-white text-[#0F1711] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C79D45]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {COLOR_OPTIONS.map(color => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleAddNewLabel()
                        }}
                        disabled={!newLabelName.trim()}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setIsAddingNew(false)
                          setNewLabelName('')
                        }}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                column && (
                  <div className="border-t border-gray-200 bg-white">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsAddingNew(true)
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-2 text-blue-600 font-medium transition-colors"
                    >
                      <Plus size={16} />
                      <span>Adicionar etiqueta</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsOpen(false)
                        setShowLabelManager(true)
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-2 text-gray-600 transition-colors"
                    >
                      <Edit2 size={14} />
                      <span>Editar etiquetas</span>
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {column && (
        <StatusLabelManager
          column={column}
          isOpen={showLabelManager}
          onClose={() => setShowLabelManager(false)}
          onUpdate={handleUpdateLabels}
          onColumnsReload={onColumnsReload}
        />
      )}
    </div>
  )
}
