'use client'

import { useState } from 'react'

export default function CreateUsersPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [message, setMessage] = useState('')

  const handleCreateUsers = async () => {
    setLoading(true)
    setMessage('')
    setResults([])

    try {
      const response = await fetch('/api/create-users', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(`Erro: ${data.error}`)
        setLoading(false)
        return
      }

      setResults(data.results)
      setMessage('Usuários processados com sucesso!')
    } catch (err: any) {
      setMessage(`Erro: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F1711' }}>
      <div className="w-full max-w-2xl p-4">
        <div 
          className="rounded-lg p-8 border"
          style={{
            backgroundColor: '#1A2A1D',
            borderColor: 'rgba(199, 157, 69, 0.3)'
          }}
        >
          <h1 
            className="text-center mb-6 text-2xl font-bold"
            style={{ color: '#C79D45' }}
          >
            Criar Usuários
          </h1>

          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(15, 23, 17, 0.5)',
                border: '1px solid rgba(199, 157, 69, 0.2)'
              }}
            >
              <p className="text-sm mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Os seguintes usuários serão criados:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <li>Raul - raul@vesto.com</li>
                <li>Model - model@vesto.com</li>
                <li>Leo - leo@vesto.com</li>
                <li>Mika - mika@vesto.com</li>
                <li>Gutinho - gutinho@vesto.com</li>
              </ul>
              <p className="text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Senha padrão para todos: Vesto@123
              </p>
            </div>

            {message && (
              <div 
                className="p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: message.includes('Erro') 
                    ? 'rgba(239, 68, 68, 0.2)' 
                    : 'rgba(34, 197, 94, 0.2)',
                  border: `1px solid ${message.includes('Erro') 
                    ? 'rgba(239, 68, 68, 0.5)' 
                    : 'rgba(34, 197, 94, 0.5)'}`,
                  color: message.includes('Erro') 
                    ? 'rgb(248, 113, 113)' 
                    : 'rgb(134, 239, 172)'
                }}
              >
                {message}
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold" style={{ color: '#C79D45' }}>
                  Resultados:
                </h3>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: result.status === 'criado' 
                        ? 'rgba(34, 197, 94, 0.2)' 
                        : result.status === 'já existe'
                        ? 'rgba(251, 191, 36, 0.2)'
                        : 'rgba(239, 68, 68, 0.2)',
                      border: `1px solid ${result.status === 'criado' 
                        ? 'rgba(34, 197, 94, 0.5)' 
                        : result.status === 'já existe'
                        ? 'rgba(251, 191, 36, 0.5)'
                        : 'rgba(239, 68, 68, 0.5)'}`,
                      color: result.status === 'criado' 
                        ? 'rgb(134, 239, 172)' 
                        : result.status === 'já existe'
                        ? 'rgb(253, 224, 71)'
                        : 'rgb(248, 113, 113)'
                    }}
                  >
                    <strong>{result.name}</strong> ({result.email}): {result.status}
                    {result.error && ` - ${result.error}`}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleCreateUsers}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'rgba(199, 157, 69, 0.3)',
                color: '#0F1711'
              }}
            >
              {loading ? 'Criando usuários...' : 'Criar Usuários'}
            </button>

            <div className="text-center">
              <a 
                href="/"
                className="text-sm underline"
                style={{ color: '#C79D45' }}
              >
                Voltar para o painel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}










