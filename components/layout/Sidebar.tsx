'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Board } from '@/supabase/migrations/types'
import { LayoutDashboard, Plus, MoreVertical, Edit2, Copy, Trash2, Bell, Settings, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import Logo from './Logo'
import NotificationsModal from '../modals/NotificationsModal'
import UserManagerModal from '../modals/UserManagerModal'
import { useToast } from '@/components/common/ToastProvider'
import ConfirmModal from '@/components/common/ConfirmModal'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(256) // 64 * 4 = 256px (w-64)
  const [isResizing, setIsResizing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { showSuccess, showError } = useToast()

  // Carregar preferências do localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed')
    const savedWidth = localStorage.getItem('sidebarWidth')
    if (savedCollapsed === 'true') {
      setIsCollapsed(true)
    }
    if (savedWidth) {
      setSidebarWidth(parseInt(savedWidth, 10))
    }
  }, [])

  // Salvar preferências no localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString())
  }, [isCollapsed])

  useEffect(() => {
    localStorage.setItem('sidebarWidth', sidebarWidth.toString())
  }, [sidebarWidth])

  // Handlers para redimensionamento
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = e.clientX
      const minWidth = 200
      const maxWidth = 500

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  // Configurar sensores para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Função para lidar com o fim do arrasto
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = boards.findIndex((board) => board.id === active.id)
    const newIndex = boards.findIndex((board) => board.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Atualizar estado local imediatamente
    const newBoards = arrayMove(boards, oldIndex, newIndex)
    setBoards(newBoards)

    // Atualizar posições no banco de dados
    try {
      const updates = newBoards.map((board, index) => ({
        id: board.id,
        position: index,
      }))

      // Atualizar todos os boards de uma vez
      for (const update of updates) {
        await supabase
          .from('boards')
          .update({ position: update.position })
          .eq('id', update.id)
      }
    } catch (error) {
      console.error('Erro ao atualizar posições:', error)
      // Reverter em caso de erro
      loadBoards()
    }
  }

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
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('workspace_id', workspaceId)
      
      if (error) {
        console.error('Erro ao carregar boards:', error)
        setBoards([])
        setLoading(false)
        return
      }

      // Ordenar boards: primeiro por position (se existir), depois por created_at como fallback
      const sortedBoards = (data || []).sort((a, b) => {
        // Se ambos têm position definido, ordenar por position
        if (a.position != null && b.position != null) {
          return a.position - b.position
        }
        // Se apenas a tem position, a vem primeiro
        if (a.position != null && b.position == null) {
          return -1
        }
        // Se apenas b tem position, b vem primeiro
        if (a.position == null && b.position != null) {
          return 1
        }
        // Se nenhum tem position, ordenar por created_at (mais recente primeiro)
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA
      })

      setBoards(sortedBoards)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar boards:', error)
      setBoards([])
      setLoading(false)
    }
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
    setIsDuplicating(board.id)

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
      showSuccess('Quadro duplicado com sucesso!')
    } catch (error) {
      console.error('Erro ao duplicar quadro:', error)
      showError('Erro ao duplicar quadro')
    } finally {
      setIsDuplicating(null)
    }
  }

  const handleDelete = async (board: Board, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenMenu(null)
    setHoveredBoard(null)
    setShowDeleteConfirm(board.id)
  }

  const confirmDelete = async () => {
    const boardId = showDeleteConfirm
    if (!boardId) return

    const board = boards.find(b => b.id === boardId)
    if (!board) return

    setIsDeleting(true)

    try {
        // Executar a deleção (ON DELETE CASCADE vai deletar grupos, itens, etc automaticamente)
        const { error, data } = await supabase
          .from('boards')
          .delete()
          .eq('id', boardId)
          .select()

        if (error) {
          console.error('Erro ao apagar quadro:', error)
          alert(`Erro ao apagar quadro: ${error.message}`)
          return
        }

        // Recarregar lista de quadros
        await loadBoards()

        // Se o board deletado estava aberto, redirecionar
        if (pathname?.includes(`/boards/${boardId}`)) {
          router.push(`/workspaces/${workspaceId}`)
          router.refresh()
        }

        showSuccess('Quadro deletado com sucesso!')
        setShowDeleteConfirm(null)
      } catch (err: any) {
        console.error('Erro ao apagar quadro:', err)
        showError(`Erro ao apagar quadro: ${err.message || 'Erro desconhecido'}`)
      } finally {
        setIsDeleting(false)
      }
  }

  const handleMenuClick = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenMenu(openMenu === boardId ? null : boardId)
  }

  return (
    <>
      <div 
        ref={sidebarRef}
        className="bg-[#1A2A1D] border-r border-[rgba(199,157,69,0.2)] flex flex-col h-screen fixed left-0 top-0 z-20 backdrop-blur-xl transition-all duration-300"
        style={{ 
          width: isCollapsed ? '60px' : `${sidebarWidth}px`,
          minWidth: isCollapsed ? '60px' : '200px',
          maxWidth: isCollapsed ? '60px' : '500px',
        }}
      >
      {/* Header */}
      <div className="p-4 border-b border-[rgba(199,157,69,0.2)] bg-[#1A2A1D]" style={{ backgroundColor: '#1A2A1D' }}>
        <div className="mb-4 flex items-center justify-between" style={{ backgroundColor: 'transparent' }}>
          {!isCollapsed && <Logo />}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-[rgba(199,157,69,0.1)] rounded transition-colors"
            title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="text-[rgba(255,255,255,0.7)]" size={18} />
            ) : (
              <ChevronLeft className="text-[rgba(255,255,255,0.7)]" size={18} />
            )}
          </button>
        </div>
        {!isCollapsed && (
          <>
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
          </>
        )}
      </div>

      {/* Boards List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className={`text-xs text-muted-foreground text-center py-4 ${isCollapsed ? 'px-0' : 'px-2'}`}>
            <div className="animate-pulse">Carregando...</div>
          </div>
        ) : boards.length === 0 ? (
          <div className={`text-center py-8 px-4 ${isCollapsed ? 'px-0' : 'px-2'}`}>
            {!isCollapsed && (
              <>
                <div className="text-4xl mb-3">📋</div>
                <p className="text-xs text-[rgba(255,255,255,0.7)] mb-2">Nenhum quadro criado ainda</p>
                <button
                  onClick={handleNewBoard}
                  className="mt-3 text-xs text-[#C79D45] hover:text-[#D4AD5F] underline transition-colors"
                >
                  Criar primeiro quadro
                </button>
              </>
            )}
            {isCollapsed && <span className="text-xs text-muted-foreground">...</span>}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={boards.map((board) => board.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0.5">
                {boards.map((board) => (
                  <SortableBoardItem
                    key={board.id}
                    board={board}
                    isActive={isActive(board.id)}
                    isCollapsed={isCollapsed}
                    hoveredBoard={hoveredBoard}
                    setHoveredBoard={setHoveredBoard}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                    editingBoard={editingBoard}
                    editName={editName}
                    setEditName={setEditName}
                    handleBoardClick={handleBoardClick}
                    handleSaveEdit={handleSaveEdit}
                    handleCancelEdit={handleCancelEdit}
                    handleEdit={handleEdit}
                    handleDuplicate={handleDuplicate}
                    handleDelete={handleDelete}
                    handleMenuClick={handleMenuClick}
                    menuRef={menuRef}
                    isDuplicating={isDuplicating}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[rgba(199,157,69,0.2)] bg-[#1A2A1D] space-y-2">
        {/* Ícones de Notificações e Configurações */}
        {!isCollapsed && (
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
        )}
        {isCollapsed && (
          <div className="flex flex-col gap-2 items-center">
            <button
              onClick={() => setShowNotifications(true)}
              className="p-2 text-[rgba(255,255,255,0.7)] hover:bg-[rgba(199,157,69,0.1)] hover:text-[rgba(255,255,255,0.95)] rounded-md transition-colors"
              title="Notificações"
            >
              <Bell size={18} />
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowUserManager(true)}
                className="p-2 text-[rgba(255,255,255,0.7)] hover:bg-[rgba(199,157,69,0.1)] hover:text-[rgba(255,255,255,0.95)] rounded-md transition-colors"
                title="Usuários"
              >
                <Settings size={18} />
              </button>
            )}
          </div>
        )}
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

      {/* Modal de Confirmação de Deletar */}
      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={confirmDelete}
          title="Deletar quadro"
          message={`Tem certeza que deseja apagar o quadro "${boards.find(b => b.id === showDeleteConfirm)?.name}"? Esta ação não pode ser desfeita e todos os dados do quadro serão removidos permanentemente.`}
          confirmText="Deletar"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isDeleting}
        />
      )}

      {/* Botão de redimensionar */}
      {!isCollapsed && (
        <div
          onMouseDown={(e) => {
            e.preventDefault()
            setIsResizing(true)
          }}
          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-[rgba(199,157,69,0.5)] transition-colors z-30"
          style={{
            backgroundColor: isResizing ? 'rgba(199,157,69,0.5)' : 'transparent',
          }}
          title="Arrastar para redimensionar"
        />
      )}
    </div>
    </>
  )
}

// Componente Sortable para cada board item
interface SortableBoardItemProps {
  board: Board
  isActive: boolean
  isCollapsed: boolean
  hoveredBoard: string | null
  setHoveredBoard: (id: string | null) => void
  openMenu: string | null
  setOpenMenu: (id: string | null) => void
  editingBoard: string | null
  editName: string
  setEditName: (name: string) => void
  handleBoardClick: (boardId: string) => void
  handleSaveEdit: (boardId: string) => void
  handleCancelEdit: () => void
  handleEdit: (board: Board, e: React.MouseEvent) => void
  handleDuplicate: (board: Board, e: React.MouseEvent) => void
  handleDelete: (board: Board, e: React.MouseEvent) => void
  handleMenuClick: (boardId: string, e: React.MouseEvent) => void
  menuRef: React.RefObject<HTMLDivElement>
  isDuplicating: string | null
}

function SortableBoardItem({
  board,
  isActive,
  isCollapsed,
  hoveredBoard,
  setHoveredBoard,
  openMenu,
  setOpenMenu,
  editingBoard,
  editName,
  setEditName,
  handleBoardClick,
  handleSaveEdit,
  handleCancelEdit,
  handleEdit,
  handleDuplicate,
  handleDelete,
  handleMenuClick,
  menuRef,
  isDuplicating,
}: SortableBoardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: board.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative w-full px-3 py-2 rounded-md text-sm transition-all ${
        isActive
          ? 'bg-[rgba(199,157,69,0.15)] text-[rgba(255,255,255,0.95)] font-medium border-l-2 border-[#C79D45]'
          : 'text-[rgba(255,255,255,0.7)] hover:bg-[rgba(199,157,69,0.1)] hover:text-[rgba(255,255,255,0.95)]'
      } ${isDragging ? 'cursor-grabbing' : ''}`}
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
          <div className="flex items-center gap-2 w-full">
            {/* Ícone de arrastar - aparece no hover */}
            {!isCollapsed && (
              <button
                {...attributes}
                {...listeners}
                className={`opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 cursor-grab active:cursor-grabbing hover:bg-[rgba(199,157,69,0.1)] rounded transition-opacity ${
                  isDragging ? 'opacity-100' : ''
                }`}
                title="Arrastar para reordenar"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical size={14} className="text-[rgba(255,255,255,0.5)]" />
              </button>
            )}
            
            <button
              onClick={() => handleBoardClick(board.id)}
              className={`${isCollapsed ? 'w-full flex items-center justify-center' : 'flex-1 text-left flex items-center gap-2'}`}
              title={isCollapsed ? board.name : undefined}
            >
              <LayoutDashboard 
                size={isCollapsed ? 18 : 14} 
                className={isActive ? 'text-[#C79D45]' : 'text-[rgba(255,255,255,0.5)]'}
              />
              {!isCollapsed && (
                <span className="truncate text-sm flex-1">{board.name}</span>
              )}
            </button>
          </div>
          
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
                    disabled={isDuplicating === board.id}
                    className="w-full text-left px-3 py-2 text-sm text-[rgba(255,255,255,0.95)] flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {isDuplicating === board.id ? 'Duplicando...' : 'Duplicar'}
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
  )
}

