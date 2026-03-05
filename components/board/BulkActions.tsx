'use client'

import { useState } from 'react'
import { X, Move, Trash2 } from 'lucide-react'
import { Group } from '@/supabase/migrations/types'
import { useToast } from '@/components/common/ToastProvider'
import ConfirmModal from '@/components/common/ConfirmModal'

interface BulkActionsProps {
  selectedItems: string[]
  groups: Group[]
  onMove: (targetGroupId: string) => Promise<void>
  onDelete: () => Promise<void>
  onClearSelection: () => void
}

export default function BulkActions({ selectedItems, groups, onMove, onDelete, onClearSelection }: BulkActionsProps) {
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [targetGroupId, setTargetGroupId] = useState('')
  const { showSuccess, showError } = useToast()

  if (selectedItems.length === 0) {
    return null
  }

  const handleMove = async () => {
    if (!targetGroupId) {
      showError('Selecione um grupo de destino')
      return
    }

    setIsMoving(true)
    try {
      await onMove(targetGroupId)
      showSuccess(`${selectedItems.length} item(ns) movido(s) com sucesso!`)
      setShowMoveModal(false)
      setTargetGroupId('')
      onClearSelection()
    } catch (error) {
      console.error('Erro ao mover itens:', error)
      showError('Erro ao mover itens')
    } finally {
      setIsMoving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
      showSuccess(`${selectedItems.length} item(ns) deletado(s) com sucesso!`)
      setShowDeleteModal(false)
      onClearSelection()
    } catch (error) {
      console.error('Erro ao deletar itens:', error)
      showError('Erro ao deletar itens')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#1A2A1D] border-2 border-[rgba(199,157,69,0.5)] rounded-lg shadow-2xl px-6 py-4 flex items-center gap-4 animate-in slide-in-from-bottom-5">
        <div className="flex items-center gap-3">
          <div className="bg-[rgba(199,157,69,0.2)] rounded-full px-3 py-1.5">
            <span className="text-sm font-semibold text-[#C79D45]">
              {selectedItems.length} selecionado(s)
            </span>
          </div>
          
          <button
            onClick={() => setShowMoveModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[rgba(199,157,69,0.15)] hover:bg-[rgba(199,157,69,0.25)] text-[#C79D45] rounded-lg transition-colors border border-[rgba(199,157,69,0.3)] hover:border-[rgba(199,157,69,0.5)]"
            title="Mover selecionados"
          >
            <Move size={16} />
            <span className="text-sm font-medium">Mover</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[rgba(239,68,68,0.15)] hover:bg-[rgba(239,68,68,0.25)] text-[rgba(252,165,165,1)] rounded-lg transition-colors border border-[rgba(239,68,68,0.3)] hover:border-[rgba(239,68,68,0.5)]"
            title="Deletar selecionados"
          >
            <Trash2 size={16} />
            <span className="text-sm font-medium">Deletar</span>
          </button>

          <button
            onClick={onClearSelection}
            className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)]"
            title="Limpar seleção"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Modal de Mover */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A2A1D] border-2 border-[rgba(199,157,69,0.5)] rounded-lg shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-4">
              Mover {selectedItems.length} item(ns)
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[rgba(255,255,255,0.8)] mb-2">
                Selecione o grupo de destino:
              </label>
              <select
                value={targetGroupId}
                onChange={(e) => setTargetGroupId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: '#C79D45',
                  backgroundColor: 'rgba(26, 42, 29, 0.7)',
                  color: 'rgba(255, 255, 255, 0.95)',
                  '--tw-ring-color': '#C79D45'
                } as React.CSSProperties}
              >
                <option value="">Selecione um grupo...</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowMoveModal(false)
                  setTargetGroupId('')
                }}
                disabled={isMoving}
                className="px-4 py-2 text-sm text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleMove}
                disabled={isMoving || !targetGroupId}
                className="px-4 py-2 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] text-sm font-semibold rounded-lg hover:from-[#D4AD5F] hover:to-[#E5C485] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMoving ? 'Movendo...' : 'Mover'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Deletar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Deletar itens selecionados"
        message={`Tem certeza que deseja deletar ${selectedItems.length} item(ns) selecionado(s)? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  )
}
