'use client'

import { useState } from 'react'
import { Link2, Check, X } from 'lucide-react'
import { useToast } from '@/components/common/ToastProvider'

interface GoogleSheetsConfigProps {
  boardId: string
  onConnect: (spreadsheetId: string) => void
  currentSpreadsheetId?: string
}

export default function GoogleSheetsConfig({ boardId, onConnect, currentSpreadsheetId }: GoogleSheetsConfigProps) {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useToast()

  const handleConnect = async () => {
    if (!spreadsheetUrl.trim()) {
      showError('Por favor, cole a URL da planilha')
      return
    }

    try {
      setLoading(true)
      
      // Extrair ID da URL
      const { extractSpreadsheetId } = await import('@/lib/google-sheets/client')
      const spreadsheetId = extractSpreadsheetId(spreadsheetUrl.trim())
      
      if (!spreadsheetId) {
        throw new Error('URL inválida. Por favor, cole a URL completa da planilha do Google Sheets.')
      }

      // Validar se a planilha existe (teste básico)
      const testResponse = await fetch(`/api/dashboard/google-sheets?spreadsheetId=${spreadsheetId}`)
      
      if (!testResponse.ok) {
        const errorData = await testResponse.json().catch(() => ({}))
        throw new Error(
          errorData.error || 
          'Não foi possível acessar a planilha. Certifique-se de que a planilha está pública ou compartilhada com "Qualquer pessoa com o link".'
        )
      }

      // Salvar no board
      const saveResponse = await fetch(`/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: JSON.stringify({ spreadsheetId }),
        }),
      })

      if (!saveResponse.ok) {
        throw new Error('Erro ao salvar configuração')
      }

      onConnect(spreadsheetId)
      showSuccess('Planilha conectada com sucesso! Os dados serão atualizados em tempo real.')
      setSpreadsheetUrl('')
    } catch (error: any) {
      console.error('Erro ao conectar:', error)
      showError(error.message || 'Erro ao conectar com Google Sheets')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: JSON.stringify({ spreadsheetId: null }),
        }),
      })

      if (response.ok) {
        onConnect('')
        showSuccess('Conexão removida com sucesso')
      }
    } catch (error: any) {
      showError('Erro ao desconectar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg p-6 border border-[rgba(199,157,69,0.2)] shadow-lg">
      <h3 className="text-lg font-bold text-[rgba(255,255,255,0.95)] mb-4">Conectar com Google Sheets</h3>
      
      {currentSpreadsheetId ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <Check size={20} />
            <span className="font-medium text-[rgba(255,255,255,0.95)]">Planilha conectada</span>
          </div>
          <div className="bg-[rgba(0,0,0,0.2)] p-3 rounded-lg text-sm text-[rgba(255,255,255,0.6)] break-all border border-[rgba(199,157,69,0.2)]">
            {currentSpreadsheetId}
          </div>
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            <X size={18} />
            Desconectar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
              URL da Planilha do Google Sheets
            </label>
            <input
              type="text"
              value={spreadsheetUrl}
              onChange={(e) => setSpreadsheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
              className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(199,157,69,0.2)] rounded-lg px-3 py-2 text-sm text-[rgba(255,255,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45]"
            />
            <div className="mt-2 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-300">
              <p className="font-medium mb-1">⚠️ Importante:</p>
              <p className="text-[rgba(255,255,255,0.8)]">Para funcionar, a planilha precisa estar:</p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-[rgba(255,255,255,0.8)]">
                <li><strong>Pública</strong> (qualquer pessoa com o link pode ver), OU</li>
                <li><strong>Compartilhada</strong> com "Qualquer pessoa com o link"</li>
              </ul>
              <p className="mt-2 text-[rgba(255,255,255,0.8)]">Para compartilhar: Clique em <strong>"Compartilhar"</strong> → <strong>"Alterar para qualquer pessoa com o link"</strong> → <strong>"Visualizador"</strong></p>
            </div>
          </div>
          
          <button
            onClick={handleConnect}
            disabled={loading || !spreadsheetUrl.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#C79D45] text-[#0F1711] rounded-lg hover:bg-[#D4AD5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-[0_4px_16px_rgba(199,157,69,0.25)]"
          >
            <Link2 size={18} />
            {loading ? 'Conectando...' : 'Conectar'}
          </button>
        </div>
      )}
    </div>
  )
}
