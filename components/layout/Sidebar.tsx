'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Board } from '@/supabase/migrations/types'
import { LayoutDashboard, Plus, MoreVertical, Edit2, Copy, Trash2, Bell, Settings } from 'lucide-react'
import Logo from './Logo'
import NotificationsModal from '../modals/NotificationsModal'
import UserManagerModal from '../modals/UserManagerModal'

interface SidebarProps {
  workspaceId: string
  currentBoardId?: string
}

export default function Sidebar({ workspaceId, currentBoardId }: SidebarProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredBoard, setHoveredBoard] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [editingBoard, setEditingBoard] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserManager, setShowUserManager] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Verificar se o usuário é admin (leozikao50@gmail.com)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user?.email) {
          setCurrentUserEmail(user.email)
          // Verificar se é o admin
          const userEmail = user.email.toLowerCase()
          if (userEmail === 'leozikao50@gmail.com') {
            setIsAdmin(true)
            localStorage.setItem('userEmail', user.email)
            return
          }
        }
      } catch (error) {
        console.log('Erro ao verificar usuário:', error)
      }
      
      // Verificar localStorage para acesso sem autenticação (desenvolvimento)
      const storedEmail = localStorage.getItem('userEmail')
      if (storedEmail && storedEmail.toLowerCase() === 'leozikao50@gmail.com') {
        setIsAdmin(true)
        setCurrentUserEmail(storedEmail)
      }
    }
    
    checkUser()
  }, [supabase])

  useEffect(() => {
    loadBoards()
    
    // Subscribe to changes
    const channel = supabase
      .channel('boards_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'boards',
        filter: `workspace_id=eq.${workspaceId}`
      }, () => {
        loadBoards()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workspaceId])

  const loadBoards = async () => {
    const { data } = await supabase
      .from('boards')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    setBoards(data || [])
    setLoading(false)
  }

  const handleBoardClick = (boardId: string) => {
    router.push(`/workspaces/${workspaceId}/boards/${boardId}`)
  }

  const handleNewBoard = () => {
    router.push(`/workspaces/${workspaceId}/boards/new`)
  }

  const isActive = (boardId: string) => {
    return pathname?.includes(`/boards/${boardId}`)
  }

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpenMenu(null)
        setHoveredBoard(null)
      }
    }

    if (openMenu) {
      // Usar setTimeout para evitar que o evento de abertura seja capturado
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [openMenu])

  const handleEdit = (board: Board, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingBoard(board.id)
    setEditName(board.name)
    setOpenMenu(null)
  }

  const handleSaveEdit = async (boardId: string) => {
    if (!editName.trim()) return

    const { error } = await supabase
      .from('boards')
      .update({ name: editName.trim() })
      .eq('id', boardId)

    if (!error) {
      setEditingBoard(null)
      setEditName('')
      loadBoards()
    }
  }

  const handleCancelEdit = () => {
    setEditingBoard(null)
    setEditName('')
  }

  const handleDuplicate = async (board: Board, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenMenu(null)

    try {
      const { getDefaultUserId } = await import('@/lib/utils')
      const defaultUserId = getDefaultUserId()

      // Buscar dados completos do board
      const { data: boardData, error: boardError } = await supabase
        .from('boards')
        .select('*')
        .eq('id', board.id)
        .single()

      if (boardError || !boardData) throw boardError

      // Criar novo board
      const { data: newBoard, error: newBoardError } = await supabase
        .from('boards')
        .insert([
          {
            name: `${board.name} (cópia)`,
            description: boardData.description,
            workspace_id: workspaceId,
            user_id: defaultUserId,
          },
        ])
        .select()
        .single()

      if (newBoardError || !newBoard) throw newBoardError

      // Buscar e duplicar grupos
      const { data: groups } = await supabase
        .from('groups')
        .select('*')
        .eq('board_id', board.id)
        .order('position')

      if (groups) {
        for (const group of groups) {
          const { data: newGroup, error: groupError } = await supabase
            .from('groups')
            .insert([
              {
                name: group.name,
                board_id: newBoard.id,
                position: group.position,
                is_collapsed: group.is_collapsed,
              },
            ])
            .select()
            .single()

          if (groupError || !newGroup) continue

          // Buscar e duplicar items do grupo
          const { data: items } = await supabase
            .from('items')
            .select('*')
            .eq('group_id', group.id)
            .order('position')

          if (items) {
            for (const item of items) {
              const { data: newItem, error: itemError } = await supabase
                .from('items')
                .insert([
                  {
                    name: item.name,
                    group_id: newGroup.id,
                    position: item.position,
                    user_id: defaultUserId,
                  },
                ])
                .select()
                .single()

              if (itemError || !newItem) continue

              // Duplicar column values
              const { data: columnValues } = await supabase
                .from('column_values')
                .select('*')
                .eq('item_id', item.id)

              if (columnValues) {
                for (const cv of columnValues) {
                  await supabase.from('column_values').insert([
                    {
                      item_id: newItem.id,
                      column_id: cv.column_id,
                      value: cv.value,
                    },
                  ])
                }
              }

              // Duplicar subitems
              const { data: subitems } = await supabase
                .from('subitems')
                .select('*')
                .eq('item_id', item.id)
                .order('position')

              if (subitems) {
                for (const subitem of subitems) {
                  await supabase.from('subitems').insert([
                    {
                      name: subitem.name,
                      item_id: newItem.id,
                      position: subitem.position,
                      is_completed: subitem.is_completed,
                    },
                  ])
                }
              }
            }
          }
        }
      }

      // Duplicar colunas
      const { data: columns } = await supabase
        .from('columns')
        .select('*')
        .eq('board_id', board.id)
        .order('position')

      if (columns) {
        const columnMap = new Map<string, string>()

        for (const column of columns) {
          const { data: newColumn, error: colError } = await supabase
            .from('columns')
            .insert([
              {
                name: column.name,
                board_id: newBoard.id,
                type: column.type,
                position: column.position,
                settings: column.settings,
              },
            ])
            .select()
            .single()

          if (!colError && newColumn) {
            columnMap.set(column.id, newColumn.id)
          }
        }

        // Atualizar column_values com os novos column_ids
        const { data: allItems } = await supabase
          .from('items')
          .select('id, group_id')
          .eq('board_id', newBoard.id)

        if (allItems) {
          for (const item of allItems) {
            const { data: groupData } = await supabase
              .from('groups')
              .select('board_id')
              .eq('id', item.group_id)
              .single()

            if (groupData?.board_id === newBoard.id) {
              // Atualizar column_values para usar os novos column_ids
              const { data: itemColumnValues } = await supabase
                .from('column_values')
                .select('*')
                .eq('item_id', item.id)

              if (itemColumnValues) {
                for (const cv of itemColumnValues) {
                  const newColumnId = columnMap.get(cv.column_id)
                  if (newColumnId && newColumnId !== cv.column_id) {
                    await supabase
                      .from('column_values')
                      .update({ column_id: newColumnId })
                      .eq('id', cv.id)
                  }
                }
              }
            }
          }
        }
      }

      loadBoards()
    } catch (error) {
      console.error('Erro ao duplicar quadro:', error)
    }
  }

  const handleDelete = async (board: Board, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Fechar menu primeiro
    setOpenMenu(null)
    setHoveredBoard(null)

    // Pequeno delay para garantir que o menu foi fechado antes de mostrar o confirm
    setTimeout(async () => {
      const confirmed = window.confirm(
        `Tem certeza que deseja apagar o quadro "${board.name}"?\n\nEsta ação não pode ser desfeita e todos os dados do quadro serão removidos permanentemente.`
      )
      
      if (!confirmed) {
        return
      }

      try {
        console.log('Iniciando deleção do quadro:', board.id)
        
        // Executar a deleção (ON DELETE CASCADE vai deletar grupos, itens, etc automaticamente)
        const { error, data } = await supabase
          .from('boards')
          .delete()
          .eq('id', board.id)
          .select()

        if (error) {
          console.error('Erro ao apagar quadro:', error)
          alert(`Erro ao apagar quadro: ${error.message}`)
          return
        }

        console.log('Quadro deletado com sucesso:', data)

        // Recarregar lista de quadros
        await loadBoards()

        // Se o board deletado estava aberto, redirecionar
        if (pathname?.includes(`/boards/${board.id}`)) {
          router.push(`/workspaces/${workspaceId}`)
          router.refresh()
        }
      } catch (err: any) {
        console.error('Erro ao apagar quadro:', err)
        alert(`Erro ao apagar quadro: ${err.message || 'Erro desconhecido'}`)
      }
    }, 100)
  }

  const handleMenuClick = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenMenu(openMenu === boardId ? null : boardId)
  }

  return (
    <div className="w-64 bg-[#1A2A1D] border-r border-[rgba(199,157,69,0.2)] flex flex-col h-screen fixed left-0 top-0 z-20 backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(199,157,69,0.2)] bg-[#1A2A1D]" style={{ backgroundColor: '#1A2A1D' }}>
        <div className="mb-4" style={{ backgroundColor: 'transparent' }}>
          <Logo />
        </div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quadros
          </h2>
        </div>
        <button
          onClick={handleNewBoard}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] rounded-lg hover:from-[#D4AD5F] hover:to-[#E5C485] text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(199,157,69,0.25)]"
        >
          <Plus size={16} />
          Novo Quadro
        </button>
      </div>

      {/* Boards List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-xs text-muted-foreground text-center py-4">Carregando...</div>
        ) : boards.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4 px-2">
            Nenhum quadro criado ainda
          </div>
        ) : (
          <div className="space-y-0.5">
            {boards.map((board) => (
              <div
                key={board.id}
                className={`group relative w-full px-3 py-2 rounded-md text-sm transition-all ${
                  isActive(board.id)
                    ? 'bg-[rgba(199,157,69,0.15)] text-[rgba(255,255,255,0.95)] font-medium border-l-2 border-[#C79D45]'
                    : 'text-[rgba(255,255,255,0.7)] hover:bg-[rgba(199,157,69,0.1)] hover:text-[rgba(255,255,255,0.95)]'
                }`}
                style={{ position: 'relative', zIndex: openMenu === board.id ? 100 : 'auto' }}
                onMouseEnter={() => setHoveredBoard(board.id)}
                onMouseLeave={() => {
                  if (!openMenu || openMenu !== board.id) {
                    setHoveredBoard(null)
                  }
                }}
              >
                {editingBoard === board.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleSaveEdit(board.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(board.id)
                      } else if (e.key === 'Escape') {
                        handleCancelEdit()
                      }
                    }}
                    autoFocus
                    className="w-full bg-transparent border-b border-[#C79D45] focus:outline-none text-sm text-[rgba(255,255,255,0.95)]"
                    style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <button
                      onClick={() => handleBoardClick(board.id)}
                      className="w-full text-left flex items-center gap-2"
                    >
                      <LayoutDashboard 
                        size={14} 
                        className={isActive(board.id) ? 'text-[#C79D45]' : 'text-[rgba(255,255,255,0.5)]'}
                      />
                      <span className="truncate text-sm flex-1">{board.name}</span>
                    </button>
                    
                    {/* Três pontinhos - aparece no hover */}
                    {(hoveredBoard === board.id || openMenu === board.id) && (
                      <div 
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-[100]" 
                        ref={openMenu === board.id ? menuRef : null}
                        style={{ zIndex: 100 }}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleMenuClick(board.id, e)
                          }}
                          className="p-1 rounded hover:bg-[rgba(199,157,69,0.2)] transition-colors relative"
                          style={{ zIndex: 100 }}
                        >
                          <MoreVertical size={14} className="text-[rgba(255,255,255,0.7)]" />
                        </button>
                        
                        {/* Menu dropdown */}
                        {openMenu === board.id && (
                          <div 
                            className="absolute right-0 top-8 rounded-lg shadow-lg min-w-[140px] sidebar-menu-dropdown"
                            style={{ 
                              backgroundColor: '#1A2A1D',
                              border: '1px solid rgba(199, 157, 69, 0.3)',
                              opacity: 1,
                              zIndex: 99999,
                              position: 'absolute'
                            } as React.CSSProperties}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleEdit(board, e)
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-[rgba(255,255,255,0.95)] flex items-center gap-2 transition-colors rounded-t-lg"
                              style={{ 
                                backgroundColor: 'transparent',
                                color: 'rgba(255, 255, 255, 0.95)'
                              } as React.CSSProperties}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(199, 157, 69, 0.15)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              <Edit2 size={14} />
                              Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDuplicate(board, e)
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-[rgba(255,255,255,0.95)] flex items-center gap-2 transition-colors"
                              style={{ 
                                backgroundColor: 'transparent',
                                color: 'rgba(255, 255, 255, 0.95)'
                              } as React.CSSProperties}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(199, 157, 69, 0.15)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              <Copy size={14} />
                              Duplicar
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDelete(board, e)
                              }}
                              className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors rounded-b-lg"
                              style={{ 
                                backgroundColor: 'transparent',
                                color: 'rgb(248, 113, 113)'
                              } as React.CSSProperties}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              <Trash2 size={14} />
                              Apagar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[rgba(199,157,69,0.2)] bg-[#1A2A1D] space-y-2">
        {/* Ícones de Notificações e Configurações */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setShowNotifications(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[rgba(255,255,255,0.7)] hover:bg-[rgba(199,157,69,0.1)] hover:text-[rgba(255,255,255,0.95)] rounded-md transition-colors border border-[rgba(199,157,69,0.2)]"
          >
            <Bell size={18} />
            <span className="text-xs">Notificações</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowUserManager(true)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[rgba(255,255,255,0.7)] hover:bg-[rgba(199,157,69,0.1)] hover:text-[rgba(255,255,255,0.95)] rounded-md transition-colors border border-[rgba(199,157,69,0.2)]"
            >
              <Settings size={18} />
              <span className="text-xs">Usuários</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Notificações */}
      {showNotifications && (
        <NotificationsModal 
          workspaceId={workspaceId}
          onClose={() => setShowNotifications(false)} 
        />
      )}

      {/* Modal de Gerenciar Usuários */}
      {showUserManager && (
        <UserManagerModal 
          workspaceId={workspaceId}
          onClose={() => setShowUserManager(false)} 
        />
      )}
    </div>
  )
}

