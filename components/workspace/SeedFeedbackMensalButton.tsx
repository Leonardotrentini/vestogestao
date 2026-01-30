'use client'

import { useState } from 'react'

interface SeedFeedbackMensalButtonProps {
  workspaceId: string
}

export default function SeedFeedbackMensalButton({ workspaceId }: SeedFeedbackMensalButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSeed = async () => {
    setLoading(true)
    setMessage('Criando quadro Feedback Mensal...')

    try {
      const response = await fetch('/api/seed-feedback-mensal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Quadro criado com sucesso! Redirecionando...')
        setTimeout(() => {
          if (data.boardId) {
            window.location.href = `/workspaces/${workspaceId}/boards/${data.boardId}`
          } else {
            fetch(`/api/boards?workspaceId=${workspaceId}`)
              .then(res => res.json())
              .then(boardsData => {
                const feedbackBoard = boardsData.boards?.find((b: any) => b.name === 'Feedback Mensal')
                if (feedbackBoard) {
                  window.location.href = `/workspaces/${workspaceId}/boards/${feedbackBoard.id}`
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
        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium text-sm shadow-sm hover:shadow transition-all"
      >
        {loading ? '⏳ Criando...' : '📆 Popular Quadro Feedback Mensal'}
      </button>
    </div>
  )
}











