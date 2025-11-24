'use client'

import { useState, useEffect } from 'react'

interface PopulateBoardsButtonProps {
  workspaceId: string
  autoRedirect?: boolean
}

export default function PopulateBoardsButton({ workspaceId, autoRedirect = false }: PopulateBoardsButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handlePopulate = async () => {
    if (!autoRedirect && !confirm('Isso vai criar 4 quadros com dados de exemplo (Web Designer, Gestão de Clientes, Conteúdo, Comercial 2025). Deseja continuar?')) {
      return
    }

    setLoading(true)
    setMessage('Criando quadros...')

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Quadros criados! Redirecionando...')
        // Buscar o primeiro quadro criado e redirecionar
        setTimeout(async () => {
          const boardsResponse = await fetch(`/api/boards?workspaceId=${workspaceId}`)
          const boardsData = await boardsResponse.json()
          
          if (boardsData.boards && boardsData.boards.length > 0) {
            window.location.href = `/workspaces/${workspaceId}/boards/${boardsData.boards[0].id}`
          } else {
            window.location.reload()
          }
        }, 1500)
      } else {
        setMessage(`Erro: ${data.error}`)
      }
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Auto-executar se autoRedirect for true
  useEffect(() => {
    if (autoRedirect) {
      handlePopulate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRedirect])

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span className={`text-sm font-medium ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </span>
      )}
      <button
        onClick={handlePopulate}
        disabled={loading}
        className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-sm shadow-sm hover:shadow transition-all"
      >
        {loading ? '⏳ Criando quadros...' : '🎯 Popular Quadros do Monday'}
      </button>
    </div>
  )
}

