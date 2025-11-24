'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit2, Trash2 } from 'lucide-react'
import { Column } from '@/supabase/migrations/types'
import { createClient } from '@/lib/supabase/client'

interface StatusOption {
  value: string
  label: string
  color: string
}

interface StatusLabelManagerProps {
  column: Column
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
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

export default function StatusLabelManager({ column, isOpen, onClose, onUpdate, onColumnsReload }: StatusLabelManagerProps) {
  const [labels, setLabels] = useState<StatusOption[]>([])
  const [editingLabel, setEditingLabel] = useState<StatusOption | null>(null)
  const [newLabel, setNewLabel] = useState({ value: '', label: '', color: COLOR_OPTIONS[0].value })
  const [isAdding, setIsAdding] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen && column) {
      loadLabels()
    }
  }, [isOpen, column])

  const loadLabels = async () => {
    if (!column?.settings || typeof column.settings !== 'object') {
      // Se não tem settings, usar opções padrão baseadas no nome da coluna
      const defaultLabels = getDefaultLabelsForColumn(column?.name || '')
      setLabels(defaultLabels)
      return
    }

    const settings = column.settings as any
    if (settings.options && Array.isArray(settings.options)) {
      setLabels(settings.options)
    } else {
      const defaultLabels = getDefaultLabelsForColumn(column?.name || '')
      setLabels(defaultLabels)
    }
  }

  const getDefaultLabelsForColumn = (columnName: string): StatusOption[] => {
    if (columnName === 'Status do cliente') {
      return [
        { value: 'faturando', label: 'Faturando', color: 'bg-green-200 text-green-800' },
        { value: 'em_progresso', label: 'Em progresso', color: 'bg-orange-200 text-orange-800' },
        { value: 'precisa_atencao', label: 'Precisa de Atenção', color: 'bg-gray-200 text-gray-800' },
      ]
    } else if (columnName === 'Status') {
      return [
        { value: 'planejamento', label: 'Planejamento', color: 'bg-blue-200 text-blue-800' },
        { value: 'em_progresso', label: 'Em progresso', color: 'bg-orange-200 text-orange-800' },
        { value: 'upado_drive', label: 'Upado no Drive', color: 'bg-pink-200 text-pink-800' },
        { value: 'parado', label: 'Parado', color: 'bg-red-200 text-red-800' },
      ]
    }
    
    return [
      { value: 'aguardo', label: 'AGUARDO', color: 'bg-orange-200 text-orange-800' },
      { value: 'aguardando_aprovacao', label: 'Aguardando apr...', color: 'bg-purple-200 text-purple-800' },
      { value: 'a_iniciar', label: 'A iniciar', color: 'bg-blue-200 text-blue-800' },
      { value: 'em_progresso', label: 'Em progresso', color: 'bg-orange-200 text-orange-800' },
      { value: 'finalizado', label: 'Finalizado', color: 'bg-green-200 text-green-800' },
    ]
  }

  const handleSaveLabels = async () => {
    if (!column) return

    const { error } = await supabase
      .from('columns')
      .update({
        settings: { options: labels }
      })
      .eq('id', column.id)

    if (error) {
      alert('Erro ao salvar etiquetas: ' + error.message)
      return
    }

    onUpdate()
    if (onColumnsReload) {
      onColumnsReload()
    } else {
      // Se não tiver callback, recarregar a página para atualizar todas as colunas
      window.location.reload()
    }
    onClose()
  }

  const handleAddLabel = () => {
    if (!newLabel.value.trim() || !newLabel.label.trim()) return

    const value = newLabel.value.trim().toLowerCase().replace(/\s+/g, '_')
    
    // Verificar se já existe
    if (labels.find(l => l.value === value)) {
      alert('Já existe uma etiqueta com esse valor!')
      return
    }

    setLabels([...labels, { ...newLabel, value }])
    setNewLabel({ value: '', label: '', color: COLOR_OPTIONS[0].value })
    setIsAdding(false)
  }

  const handleUpdateLabel = (oldValue: string, updated: StatusOption) => {
    setLabels(labels.map(l => l.value === oldValue ? updated : l))
    setEditingLabel(null)
  }

  const handleDeleteLabel = (value: string) => {
    if (confirm('Tem certeza que deseja deletar esta etiqueta?')) {
      setLabels(labels.filter(l => l.value !== value))
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Gerenciar Etiquetas - {column?.name}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {labels.map((label) => (
                <div key={label.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  {editingLabel?.value === label.value ? (
                    <>
                      <input
                        type="text"
                        value={editingLabel.label}
                        onChange={(e) => setEditingLabel({ ...editingLabel, label: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Nome da etiqueta"
                      />
                      <select
                        value={editingLabel.color}
                        onChange={(e) => setEditingLabel({ ...editingLabel, color: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {COLOR_OPTIONS.map(color => (
                          <option key={color.value} value={color.value}>
                            {color.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleUpdateLabel(label.value, editingLabel)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingLabel(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${label.color} flex-1`}>
                        {label.label}
                      </span>
                      <span className="text-xs text-gray-500">{label.value}</span>
                      <button
                        onClick={() => setEditingLabel(label)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteLabel(label.value)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        title="Deletar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {isAdding ? (
              <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newLabel.label}
                    onChange={(e) => setNewLabel({ ...newLabel, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="Nome da etiqueta"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    autoFocus
                  />
                  <select
                    value={newLabel.color}
                    onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {COLOR_OPTIONS.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddLabel}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false)
                      setNewLabel({ value: '', label: '', color: COLOR_OPTIONS[0].value })
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Plus size={16} />
                Adicionar Nova Etiqueta
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveLabels}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

