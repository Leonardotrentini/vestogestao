'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Item, Column, ColumnValue, Subitem, Comment } from '@/supabase/migrations/types'
import { X, MessageSquare, FileText, Activity } from 'lucide-react'
import { getDefaultUserId } from '@/lib/utils'
import { format } from 'date-fns'

interface ItemDetailModalProps {
  item: Item
  columns: Column[]
  columnValues?: Record<string, ColumnValue>
  boardId?: string
  onClose: () => void
  onUpdate?: () => void
}

export default function ItemDetailModal({
  item,
  columns,
  columnValues: propColumnValues,
  boardId,
  onClose,
  onUpdate,
}: ItemDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'atualizacoes' | 'subitens' | 'arquivos' | 'log'>('atualizacoes')
  const [subitems, setSubitems] = useState<Subitem[]>([])
  const [newSubitemName, setNewSubitemName] = useState('')
  const [columnValues, setColumnValues] = useState<Record<string, ColumnValue>>(propColumnValues || {})
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const supabase = createClient()
  const defaultUserId = getDefaultUserId()

  useEffect(() => {
    loadSubitems()
    if (!propColumnValues) {
      loadColumnValues()
    }
    if (activeTab === 'atualizacoes') {
      loadComments()
    }
  }, [item.id, activeTab])

  const loadColumnValues = async () => {
    const { data: values } = await supabase
      .from('column_values')
      .select('*, columns(*)')
      .eq('item_id', item.id)

    const valuesMap: Record<string, ColumnValue> = {}
    values?.forEach((cv: any) => {
      if (cv.columns) {
        valuesMap[cv.columns.id] = cv
      }
    })
    setColumnValues(valuesMap)
  }

  const loadSubitems = async () => {
    const { data } = await supabase
      .from('subitems')
      .select('*')
      .eq('item_id', item.id)
      .order('position', { ascending: true })

    setSubitems(data || [])
  }

  const handleCreateSubitem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubitemName.trim()) return

    const maxPosition = subitems.length

    await supabase.from('subitems').insert({
      name: newSubitemName.trim(),
      item_id: item.id,
      position: maxPosition,
    })

    setNewSubitemName('')
    loadSubitems()
  }

  const handleToggleSubitem = async (subitemId: string, isCompleted: boolean) => {
    await supabase
      .from('subitems')
      .update({ is_completed: !isCompleted })
      .eq('id', subitemId)

    loadSubitems()
  }

  const handleDeleteSubitem = async (subitemId: string) => {
    await supabase.from('subitems').delete().eq('id', subitemId)
    loadSubitems()
  }

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('item_id', item.id)
      .order('created_at', { ascending: false })

    setComments(data || [])
  }

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    await supabase.from('comments').insert({
      item_id: item.id,
      user_id: defaultUserId,
      content: newComment.trim(),
    })

    setNewComment('')
    loadComments()
    onUpdate?.()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 flex gap-1">
          <button
            onClick={() => setActiveTab('atualizacoes')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'atualizacoes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span>Atualizações</span>
              {comments.length > 0 && (
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {comments.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('subitens')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'subitens'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>Subitens</span>
              {subitems.length > 0 && (
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {subitems.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'log'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity size={16} />
              <span>Log de atividade</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {/* Tab: Atualizações */}
          {activeTab === 'atualizacoes' && (
            <div className="space-y-6">
              {/* Campo para escrever atualização */}
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva uma atualização e mencione outros com @"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button className="hover:text-gray-700">@</button>
                    <button className="hover:text-gray-700">📎</button>
                    <button className="hover:text-gray-700">GIF</button>
                    <button className="hover:text-gray-700">😊</button>
                  </div>
                  <button
                    onClick={handleCreateComment}
                    disabled={!newComment.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Postar
                  </button>
                </div>
              </div>

              {/* Lista de comentários */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma atualização ainda</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                          {comment.user_id.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">Usuário</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.created_at), "dd/MM/yyyy 'às' HH:mm")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab: Subitens */}
          {activeTab === 'subitens' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subitens</h3>
              
              <div className="space-y-2 mb-4">
                {subitems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum subitem ainda</p>
                ) : (
                  subitems.map((subitem) => (
                    <div
                      key={subitem.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={subitem.is_completed}
                        onChange={() => handleToggleSubitem(subitem.id, subitem.is_completed)}
                        className="w-4 h-4"
                      />
                      <span
                        className={`flex-1 ${subitem.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}
                      >
                        {subitem.name}
                      </span>
                      <button
                        onClick={() => handleDeleteSubitem(subitem.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleCreateSubitem} className="flex gap-2">
                <input
                  type="text"
                  value={newSubitemName}
                  onChange={(e) => setNewSubitemName(e.target.value)}
                  placeholder="Adicionar subitem"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Adicionar
                </button>
              </form>
            </div>
          )}

          {/* Tab: Log de atividade */}
          {activeTab === 'log' && (
            <div>
              <p className="text-gray-500 text-center py-8">Log de atividade em breve</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

