'use client'

import { useState } from 'react'

interface SeedGestaoClientesButtonProps {
  workspaceId: string
}

export default function SeedGestaoClientesButton({ workspaceId }: SeedGestaoClientesButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSeed = async () => {
    setLoading(true)
    setMessage('Criando quadro Gestão de Clientes...')

    try {
      const response = await fetch('/api/seed-gestao-clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Dados atualizados com sucesso! Recarregando...')
        setTimeout(() => {
          // Recarregar a página atual se já estiver no quadro, senão redirecionar
          if (window.location.pathname.includes('/boards/')) {
            window.location.reload()
          } else if (data.boardId) {
            window.location.href = `/workspaces/${workspaceId}/boards/${data.boardId}`
          } else {
            // Se não retornou boardId, buscar o quadro criado
            fetch(`/api/boards?workspaceId=${workspaceId}`)
              .then(res => res.json())
              .then(boardsData => {
                const gestaoBoard = boardsData.boards?.find((b: any) => b.name === 'Gestão de Clientes')
                if (gestaoBoard) {
                  window.location.href = `/workspaces/${workspaceId}/boards/${gestaoBoard.id}`
                } else {
                  window.location.reload()
                }
              })
          }
        }, 2000)
      } else {
        setMessage(`Erro: ${data.error}`)
      }
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span className={`text-sm font-medium ${message.includes('sucesso') || message.includes('Redirecionando') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </span>
      )}
      <button
        onClick={handleSeed}
        disabled={loading}
        className="bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium text-sm shadow-sm hover:shadow transition-all"
      >
        {loading ? '⏳ Criando...' : '📊 Popular Quadro Gestão de Clientes'}
      </button>
    </div>
  )
}

