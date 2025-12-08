'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DocumentEditorProps {
  boardId: string
  initialContent?: string
}

export default function DocumentEditor({ boardId, initialContent = '' }: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [savedContent, setSavedContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const supabase = createClient()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Carregar conteúdo do banco ao montar
  useEffect(() => {
    const loadContent = async () => {
      const { data } = await supabase
        .from('boards')
        .select('content')
        .eq('id', boardId)
        .single()

      if (data?.content) {
        setContent(data.content || '')
        setSavedContent(data.content || '')
      } else if (initialContent) {
        setContent(initialContent)
        setSavedContent(initialContent)
      }
    }
    loadContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId])

  const saveContent = async (text: string) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('boards')
        .update({ content: text })
        .eq('id', boardId)

      if (!error) {
        setLastSaved(new Date())
        setSavedContent(text)
      } else {
        console.error('Erro ao salvar conteúdo:', error)
      }
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error)
    } finally {
      setSaving(false)
    }
  }

  // Auto-save após 2 segundos de inatividade
  useEffect(() => {
    if (content === savedContent) return

    // Limpar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Criar novo timeout
    saveTimeoutRef.current = setTimeout(async () => {
      await saveContent(content)
    }, 2000) // 2 segundos de delay

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  const handleManualSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    await saveContent(content)
  }

  const hasChanges = content !== savedContent

  return (
    <div className="flex-1 flex flex-col bg-[#0F1711]">
      {/* Barra de status */}
      <div className="px-6 py-2 border-b border-[rgba(199,157,69,0.2)] flex items-center justify-between bg-[#1A2A1D]">
        <div className="flex items-center gap-3 text-sm">
          {saving && (
            <span className="text-[rgba(255,255,255,0.7)] flex items-center gap-2">
              <span className="w-2 h-2 bg-[#C79D45] rounded-full animate-pulse"></span>
              Salvando...
            </span>
          )}
          {!saving && lastSaved && !hasChanges && (
            <span className="text-[rgba(255,255,255,0.5)]">
              Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {!saving && hasChanges && (
            <span className="text-[rgba(255,255,255,0.7)]">Não salvo</span>
          )}
        </div>
        <button
          onClick={handleManualSave}
          disabled={saving || !hasChanges}
          className="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: saving || !hasChanges 
              ? 'rgba(199, 157, 69, 0.2)' 
              : 'rgba(199, 157, 69, 0.3)',
            color: saving || !hasChanges 
              ? 'rgba(255, 255, 255, 0.5)' 
              : '#C79D45'
          }}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Editor de texto */}
      <div className="flex-1 p-6 overflow-auto">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comece a escrever... Este é um documento em branco onde você pode escrever texto livre."
          className="w-full h-full resize-none focus:outline-none text-[rgba(255,255,255,0.95)] leading-relaxed"
          style={{
            backgroundColor: 'transparent',
            fontSize: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        />
      </div>
    </div>
  )
}
