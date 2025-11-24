'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Settings, Plus, Trash2, User, Mail } from 'lucide-react'

interface UserManagerModalProps {
  workspaceId: string
  onClose: () => void
}

interface User {
  id: string
  email: string
  name?: string
  created_at?: string
}

export default function UserManagerModal({ workspaceId, onClose }: UserManagerModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      // Buscar usuários através do Supabase Auth (admin only)
      // Como não temos acesso direto à lista de usuários via client,
      // vamos usar uma abordagem de armazenar em uma tabela users personalizada
      // ou usar os dados do auth.users através de uma função admin
      
      // Por enquanto, vamos buscar usuários únicos dos boards do workspace
      const { data: boards } = await supabase
        .from('boards')
        .select('user_id')
        .eq('workspace_id', workspaceId)

      const userIds = new Set(boards?.map(b => b.user_id) || [])
      
      // Buscar informações dos usuários através dos dados do auth
      // Como não temos acesso direto ao auth.users via client,
      // vamos criar uma lista básica e depois expandir
      
      const { getDefaultUserId } = await import('@/lib/utils')
      const defaultUserId = getDefaultUserId()
      
      // Criar lista inicial de usuários conhecidos
      const userList: User[] = []
      
      // Adicionar usuário padrão se existir
      if (userIds.has(defaultUserId)) {
        userList.push({
          id: defaultUserId,
          email: 'usuario@interno.com',
          name: 'Usuário Padrão'
        })
      }
      
      // Adicionar você (admin)
      userList.push({
        id: 'admin-user-id',
        email: 'leozikao50@gmail.com',
        name: 'leotrentini'
      })

      setUsers(userList)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      // Fallback: usuário padrão e admin
      setUsers([
        {
          id: '00000000-0000-0000-0000-000000000000',
          email: 'usuario@interno.com',
          name: 'Usuário Padrão'
        },
        {
          id: 'admin-user-id',
          email: 'leozikao50@gmail.com',
          name: 'leotrentini'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserEmail.trim() || !newUserPassword.trim()) {
      alert('Por favor, preencha o e-mail e a senha')
      return
    }

    if (newUserPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setAdding(true)
    try {
      // Criar usuário usando Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail.trim(),
        password: newUserPassword.trim(),
        options: {
          data: {
            name: newUserName.trim() || newUserEmail.trim().split('@')[0],
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Adicionar à lista local
        const newUser: User = {
          id: data.user.id,
          email: data.user.email || newUserEmail.trim(),
          name: newUserName.trim() || newUserEmail.trim().split('@')[0],
          created_at: new Date().toISOString()
        }

        setUsers([...users, newUser])
        setNewUserEmail('')
        setNewUserName('')
        setNewUserPassword('')
        setShowAddForm(false)
        
        alert('Usuário criado com sucesso!')
      }
    } catch (error: any) {
      console.error('Erro ao adicionar usuário:', error)
      alert(`Erro ao adicionar usuário: ${error.message}`)
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return

    const { getDefaultUserId } = await import('@/lib/utils')
    const defaultUserId = getDefaultUserId()

    // Não permitir deletar o usuário padrão
    if (userId === defaultUserId) {
      alert('Não é possível remover o usuário padrão')
      return
    }

    setUsers(users.filter(u => u.id !== userId))
    
    // TODO: Deletar do banco de dados quando a tabela de usuários estiver pronta
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div 
          className="bg-[#1A2A1D] rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-[rgba(199,157,69,0.3)] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[rgba(199,157,69,0.2)]">
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-[#C79D45]" />
              <h2 className="text-lg font-semibold text-[rgba(255,255,255,0.95)]">
                Gerenciar Usuários
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[rgba(199,157,69,0.1)] rounded text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Botão Adicionar Usuário */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] rounded-lg hover:from-[#D4AD5F] hover:to-[#E5C485] font-semibold transition-all"
              >
                <Plus size={18} />
                Adicionar Usuário
              </button>
            ) : (
              <form onSubmit={handleAddUser} className="mb-4 p-4 bg-[rgba(0,0,0,0.2)] rounded-lg border border-[rgba(199,157,69,0.2)]">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Nome do usuário"
                      className="w-full px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(199,157,69,0.2)] rounded-lg text-[rgba(255,255,255,0.95)] text-sm focus:outline-none focus:ring-2 focus:ring-[#C79D45]"
                      style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="usuario@exemplo.com"
                      className="w-full px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(199,157,69,0.2)] rounded-lg text-[rgba(255,255,255,0.95)] text-sm focus:outline-none focus:ring-2 focus:ring-[#C79D45]"
                      style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[rgba(255,255,255,0.7)] mb-1">
                      Senha *
                    </label>
                    <input
                      type="password"
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      className="w-full px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(199,157,69,0.2)] rounded-lg text-[rgba(255,255,255,0.95)] text-sm focus:outline-none focus:ring-2 focus:ring-[#C79D45]"
                      style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={adding || !newUserEmail.trim() || !newUserPassword.trim()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] rounded-lg hover:from-[#D4AD5F] hover:to-[#E5C485] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {adding ? 'Adicionando...' : 'Adicionar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setNewUserEmail('')
                        setNewUserName('')
                        setNewUserPassword('')
                      }}
                      className="px-4 py-2 bg-[rgba(0,0,0,0.3)] text-[rgba(255,255,255,0.7)] rounded-lg hover:bg-[rgba(0,0,0,0.4)] transition-colors border border-[rgba(199,157,69,0.2)]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Lista de Usuários */}
            {loading ? (
              <div className="text-center text-[rgba(255,255,255,0.7)] py-8">
                Carregando...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center text-[rgba(255,255,255,0.7)] py-8">
                <User size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhum usuário cadastrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 bg-[rgba(0,0,0,0.2)] rounded-lg border border-[rgba(199,157,69,0.2)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[rgba(199,157,69,0.2)] flex items-center justify-center">
                        <User size={20} className="text-[#C79D45]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[rgba(255,255,255,0.95)]">
                          {user.name || user.email.split('@')[0]}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-[rgba(255,255,255,0.5)]">
                          <Mail size={12} />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                      title="Remover usuário"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

