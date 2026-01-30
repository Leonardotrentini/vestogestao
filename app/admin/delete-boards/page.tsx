'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteBoardsPage() {
  const [boards, setBoards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const loadBoards = async () => {
    setLoading(true)
    setMessage(null)

    try {
      // Buscar TODOS os quadros
      const { data: allBoards, error: fetchAllError } = await supabase
        .from('boards')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })

      if (fetchAllError) {
        setMessage(`Erro ao buscar quadros: ${fetchAllError.message}`)
        return
      }

      setBoards(allBoards || [])

      // Buscar os quadros específicos
      const { data: targetBoards, error: fetchError } = await supabase
        .from('boards')
        .select('id, name')
        .or('name.ilike.%CHURN%,name.ilike.%links clicaveis%')

      if (fetchError) {
        setMessage(`Erro: ${fetchError.message}`)
      } else if (targetBoards && targetBoards.length > 0) {
        setMessage(`Encontrados ${targetBoards.length} quadro(s) para deletar`)
      }
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteBoard = async (boardId: string, boardName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o quadro "${boardName}"?`)) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', boardId)

      if (error) {
        setMessage(`Erro ao deletar quadro: ${error.message}`)
      } else {
        setMessage(`✅ Quadro "${boardName}" deletado com sucesso!`)
        loadBoards() // Recarregar lista
      }
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteTargetBoards = async () => {
    if (!confirm('Tem certeza que deseja deletar os 2 quadros (CHURN e links clicaveis)?')) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Buscar os quadros específicos
      const { data: targetBoards, error: fetchError } = await supabase
        .from('boards')
        .select('id, name')
        .or('name.ilike.%CHURN%,name.ilike.%links clicaveis%')

      if (fetchError) {
        setMessage(`Erro ao buscar quadros: ${fetchError.message}`)
        return
      }

      if (!targetBoards || targetBoards.length === 0) {
        setMessage('Nenhum quadro encontrado para deletar')
        return
      }

      // Deletar cada quadro
      for (const board of targetBoards) {
        const { error: deleteError } = await supabase
          .from('boards')
          .delete()
          .eq('id', board.id)

        if (deleteError) {
          setMessage(`Erro ao deletar quadro ${board.name}: ${deleteError.message}`)
          return
        }
      }

      setMessage(`✅ ${targetBoards.length} quadro(s) deletado(s) com sucesso!`)
      loadBoards() // Recarregar lista
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1711] p-8" style={{ backgroundImage: 'radial-gradient(at 0% 0%, rgba(199, 157, 69, 0.08) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(33, 47, 35, 0.2) 0%, transparent 50%)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[rgba(255,255,255,0.95)] mb-6 font-main">
          Deletar Quadros
        </h1>

        <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg border border-[rgba(199,157,69,0.2)] p-6 space-y-4">
          <div className="flex gap-4">
            <button
              onClick={loadBoards}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] rounded-lg hover:from-[#D4AD5F] hover:to-[#E5C485] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
            >
              Carregar Todos os Quadros
            </button>
            <button
              onClick={deleteTargetBoards}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
            >
              Deletar 2 Quadros (CHURN + links clicaveis)
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('✅') || message.includes('sucesso')
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}>
              {message}
            </div>
          )}

          {boards.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-[rgba(255,255,255,0.95)] mb-4">
                Todos os Quadros ({boards.length})
              </h2>
              <div className="space-y-2">
                {boards.map((board) => (
                  <div
                    key={board.id}
                    className="flex items-center justify-between p-3 bg-[rgba(0,0,0,0.2)] rounded-lg border border-[rgba(199,157,69,0.2)]"
                  >
                    <span className="text-[rgba(255,255,255,0.95)]">{board.name}</span>
                    <button
                      onClick={() => deleteBoard(board.id, board.name)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Deletar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center text-[rgba(255,255,255,0.7)] py-4">
              Carregando...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}











