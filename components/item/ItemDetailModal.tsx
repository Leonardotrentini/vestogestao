'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Item, Column, ColumnValue, Subitem, Comment } from '@/supabase/migrations/types'
import { X, MessageSquare, FileText, Activity } from 'lucide-react'
import { getDefaultUserId } from '@/lib/utils'
import { format } from 'date-fns'
import MentionInput from '@/components/common/MentionInput'
import { extractMentions, notifyMention } from '@/lib/notifications'

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
  const [isEditingName, setIsEditingName] = useState(false)
  const [itemName, setItemName] = useState(item.name)
  const supabase = createClient()
  const defaultUserId = getDefaultUserId()

  useEffect(() => {
    setItemName(item.name)
  }, [item.name])

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

    // Extrair menções do comentário
    const mentions = extractMentions(newComment)
    
    // Criar comentário
    await supabase.from('comments').insert({
      item_id: item.id,
      user_id: defaultUserId,
      content: newComment.trim(),
    })

    // Criar notificações para usuários mencionados
    if (mentions.length > 0 && boardId) {
      // Buscar usuários via API route
      try {
        const response = await fetch('/api/users')
        const users: Array<{ id: string; email: string; name?: string }> = await response.json()
        
        for (const mention of mentions) {
          const mentionedUser = users.find(u => {
            const email = u.email?.toLowerCase() || ''
            const username = email.split('@')[0]
            return username === mention.toLowerCase() || email === mention.toLowerCase()
          })

          if (mentionedUser) {
            await notifyMention(
              mentionedUser.id,
              item.id,
              item.name,
              newComment.trim(),
              boardId
            )
          }
        }
      } catch (error) {
        console.error('Erro ao criar notificações de menção:', error)
      }
    }

    setNewComment('')
    loadComments()
    onUpdate?.()
  }

  const handleMention = async (userId: string, userName: string) => {
    // Esta função é chamada quando um usuário é mencionado no input
    // A notificação será criada quando o comentário for postado
  }

  const handleUpdateItemName = async () => {
    if (itemName.trim() && itemName.trim() !== item.name) {
      await supabase
        .from('items')
        .update({ name: itemName.trim() })
        .eq('id', item.id)
      
      onUpdate?.()
    }
    setIsEditingName(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1A2A1D] rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-[rgba(199,157,69,0.3)]">
        <div className="sticky top-0 bg-[#1A2A1D] border-b border-[rgba(199,157,69,0.2)] px-6 py-4 flex items-center justify-between z-10">
          {isEditingName ? (
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onBlur={handleUpdateItemName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateItemName()
                } else if (e.key === 'Escape') {
                  setItemName(item.name)
                  setIsEditingName(false)
                }
              }}
              className="text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#C79D45] px-2 py-1 rounded"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(199, 157, 69, 0.3)'
              } as React.CSSProperties}
              autoFocus
            />
          ) : (
            <h2 
              className="text-2xl font-bold text-[rgba(255,255,255,0.95)] cursor-pointer hover:text-[#C79D45] transition-colors"
              onDoubleClick={() => setIsEditingName(true)}
              title="Duplo clique para editar"
            >
              {item.name}
            </h2>
          )}
          <button
            onClick={onClose}
            className="text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] hover:bg-[rgba(199,157,69,0.1)] rounded p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[rgba(199,157,69,0.2)] px-6 flex gap-1">
          <button
            onClick={() => setActiveTab('atualizacoes')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'atualizacoes'
                ? 'border-[#C79D45] text-[#C79D45]'
                : 'border-transparent text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span>Atualizações</span>
              {comments.length > 0 && (
                <span className="bg-[rgba(199,157,69,0.2)] text-[#C79D45] px-2 py-0.5 rounded-full text-xs">
                  {comments.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('subitens')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'subitens'
                ? 'border-[#C79D45] text-[#C79D45]'
                : 'border-transparent text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>Subitens</span>
              {subitems.length > 0 && (
                <span className="bg-[rgba(199,157,69,0.2)] text-[#C79D45] px-2 py-0.5 rounded-full text-xs">
                  {subitems.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'log'
                ? 'border-[#C79D45] text-[#C79D45]'
                : 'border-transparent text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity size={16} />
              <span>Log de atividade</span>
            </div>
          </button>
        </div>

        <div className="p-6 bg-[#0F1711]">
          {/* Tab: Atualizações */}
          {activeTab === 'atualizacoes' && (
            <div className="space-y-6">
              {/* Campo para escrever atualização */}
              <div className="space-y-3">
                <MentionInput
                  value={newComment}
                  onChange={setNewComment}
                  placeholder="Escreva uma atualização e mencione outros com @"
                  rows={4}
                  onMention={handleMention}
                  itemId={item.id}
                  boardId={boardId}
                  itemName={item.name}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.7)]">
                    <button className="hover:text-[#C79D45] transition-colors">@</button>
                    <button className="hover:text-[#C79D45] transition-colors">📎</button>
                    <button className="hover:text-[#C79D45] transition-colors">GIF</button>
                    <button className="hover:text-[#C79D45] transition-colors">😊</button>
                  </div>
                  <button
                    onClick={handleCreateComment}
                    disabled={!newComment.trim()}
                    className="bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] px-4 py-2 rounded-lg hover:from-[#D4AD5F] hover:to-[#E5C485] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                  >
                    Postar
                  </button>
                </div>
              </div>

              {/* Lista de comentários */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-[rgba(255,255,255,0.7)] text-center py-8">Nenhuma atualização ainda</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-b border-[rgba(199,157,69,0.2)] pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#C79D45] flex items-center justify-center text-sm font-medium text-[#0F1711]">
                          {comment.user_id.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-[rgba(255,255,255,0.95)]">Usuário</span>
                            <span className="text-xs text-[rgba(255,255,255,0.5)]">
                              {format(new Date(comment.created_at), "dd/MM/yyyy 'às' HH:mm")}
                            </span>
                          </div>
                          <p className="text-sm text-[rgba(255,255,255,0.9)] whitespace-pre-wrap">{comment.content}</p>
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
              <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-4">Subitens</h3>
              
              <div className="space-y-2 mb-4">
                {subitems.length === 0 ? (
                  <p className="text-[rgba(255,255,255,0.7)] text-center py-8">Nenhum subitem ainda</p>
                ) : (
                  subitems.map((subitem) => (
                    <div
                      key={subitem.id}
                      className="flex items-center gap-3 p-2 hover:bg-[rgba(199,157,69,0.1)] rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={subitem.is_completed}
                        onChange={() => handleToggleSubitem(subitem.id, subitem.is_completed)}
                        className="w-4 h-4 text-[#C79D45] border-[rgba(199,157,69,0.3)] rounded"
                      />
                      <span
                        className={`flex-1 ${subitem.is_completed ? 'line-through text-[rgba(255,255,255,0.5)]' : 'text-[rgba(255,255,255,0.95)]'}`}
                      >
                        {subitem.name}
                      </span>
                      <button
                        onClick={() => handleDeleteSubitem(subitem.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors"
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
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C79D45]"
                  style={{
                    borderColor: 'rgba(199, 157, 69, 0.3)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    color: 'rgba(255, 255, 255, 0.95)'
                  } as React.CSSProperties}
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] px-4 py-2 rounded-md hover:from-[#D4AD5F] hover:to-[#E5C485] font-semibold transition-all"
                >
                  Adicionar
                </button>
              </form>
            </div>
          )}

          {/* Tab: Log de atividade */}
          {activeTab === 'log' && (
            <div>
              <p className="text-[rgba(255,255,255,0.7)] text-center py-8">Log de atividade em breve</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

