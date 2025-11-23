'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewBoardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    params.then(p => setWorkspaceId(p.workspaceId))
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { getDefaultUserId } = await import('@/lib/utils')
    const defaultUserId = getDefaultUserId()

    const { data, error } = await supabase
      .from('boards')
      .insert([
        {
          name,
          description: description || null,
          workspace_id: workspaceId,
          user_id: defaultUserId,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating board:', error)
      setLoading(false)
      return
    }

    // Criar colunas padrão
    const defaultColumns = [
      { name: 'Pessoa', type: 'person', position: 1 },
      { name: 'Status', type: 'status', position: 2 },
      { name: 'Prioridade', type: 'priority', position: 3 },
      { name: 'Inicio-Finalização', type: 'date', position: 4 },
      { name: 'Controle de tempo', type: 'time_tracking', position: 5 },
    ]

    for (const col of defaultColumns) {
      await supabase.from('columns').insert({
        name: col.name,
        board_id: data.id,
        type: col.type,
        position: col.position,
      })
    }

    if (workspaceId) {
      router.push(`/workspaces/${workspaceId}/boards/${data.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Vestogestao</h1>
          <button
            onClick={() => workspaceId && router.push(`/workspaces/${workspaceId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Voltar
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Novo Quadro
        </h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Web Designer - Clientes"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descrição opcional do quadro"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Quadro'}
            </button>
            <button
              type="button"
              onClick={() => workspaceId && router.push(`/workspaces/${workspaceId}`)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

