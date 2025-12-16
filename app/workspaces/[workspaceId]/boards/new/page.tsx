'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { LayoutDashboard, FileText, ArrowLeft, Upload } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function NewBoardPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [boardType, setBoardType] = useState<'board' | 'document'>('board')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const router = useRouter()
  const params = useParams()
  const workspaceId = params?.workspaceId as string
  const supabase = createClient()

  // Função para converter Excel para formato de board
  const convertExcelToBoard = (excelData: any[][], defaultName: string) => {
    if (!excelData || excelData.length === 0) {
      throw new Error('Planilha vazia')
    }

    // Primeira linha pode ser cabeçalho
    const headers = excelData[0] || []
    const rows = excelData.slice(1).filter(row => row.some(cell => cell !== '' && cell != null))

    // Criar estrutura de board
    const boardData: any = {
      name: defaultName,
      type: 'board',
      columns: [],
      groups: []
    }

    // Se a primeira coluna for "Grupo" ou similar, agrupar por grupos
    // Caso contrário, criar um grupo padrão
    const firstCol = headers[0]?.toString().toLowerCase() || ''
    const hasGroups = firstCol.includes('grupo') || firstCol.includes('group')

    if (hasGroups) {
      // Agrupar por primeira coluna
      const groupsMap = new Map<string, any[]>()

      rows.forEach((row: any[]) => {
        const groupName = row[0]?.toString().trim() || 'Sem grupo'
        if (!groupsMap.has(groupName)) {
          groupsMap.set(groupName, [])
        }
        groupsMap.get(groupName)!.push(row)
      })

      // Criar grupos e itens
      let groupPosition = 0
      groupsMap.forEach((items, groupName) => {
        const group = {
          name: groupName,
          position: groupPosition++,
          is_collapsed: false,
          items: items.map((row, itemIndex) => {
            const item: any = {
              name: row[1]?.toString().trim() || `Item ${itemIndex + 1}`,
              position: itemIndex,
              columnValues: []
            }

            // Adicionar valores das colunas (pulando grupo e nome)
            for (let i = 2; i < headers.length; i++) {
              if (headers[i] && row[i] !== undefined && row[i] !== '') {
                item.columnValues.push({
                  column_name: headers[i].toString(),
                  value: row[i]
                })
              }
            }

            return item
          })
        }
        boardData.groups.push(group)
      })

      // Criar colunas baseadas nos headers (pulando grupo e nome do item)
      for (let i = 2; i < headers.length; i++) {
        if (headers[i]) {
          boardData.columns.push({
            name: headers[i].toString(),
            type: 'text', // Tipo padrão, pode ser melhorado depois
            position: i - 2
          })
        }
      }
    } else {
      // Sem grupos, criar um grupo padrão
      const defaultGroup = {
        name: 'Itens',
        position: 0,
        is_collapsed: false,
        items: rows.map((row: any[], itemIndex: number) => {
          const item: any = {
            name: row[0]?.toString().trim() || `Item ${itemIndex + 1}`,
            position: itemIndex,
            columnValues: []
          }

          // Adicionar valores das colunas
          for (let i = 1; i < headers.length; i++) {
            if (headers[i] && row[i] !== undefined && row[i] !== '') {
              item.columnValues.push({
                column_name: headers[i].toString(),
                value: row[i]
              })
            }
          }

          return item
        })
      }
      boardData.groups.push(defaultGroup)

      // Criar colunas baseadas nos headers (pulando primeira coluna que é o nome)
      for (let i = 1; i < headers.length; i++) {
        if (headers[i]) {
          boardData.columns.push({
            name: headers[i].toString(),
            type: 'text',
            position: i - 1
          })
        }
      }
    }

    return boardData
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { getDefaultUserId } = await import('@/lib/utils')
      const defaultUserId = getDefaultUserId()

      // Inserir board com o tipo especificado
      const { data, error: insertError } = await supabase
        .from('boards')
        .insert([
          {
            name,
            description: description || null,
            workspace_id: workspaceId,
            user_id: defaultUserId,
            type: boardType,
            content: boardType === 'document' ? '' : null,
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating board:', insertError)
        setError(`Erro ao criar quadro: ${insertError.message}`)
        setLoading(false)
        return
      }

      if (!data) {
        setError('Erro: Quadro criado mas não retornou dados')
        setLoading(false)
        return
      }

      // Criar colunas padrão apenas se for um board (não documento)
      if (boardType === 'board') {
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
      }

      if (workspaceId && data.id) {
        router.push(`/workspaces/${workspaceId}/boards/${data.id}`)
        router.refresh()
      } else {
        setError('Erro: workspaceId ou boardId não encontrado')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Error:', err)
      setError(`Erro inesperado: ${err.message || 'Erro desconhecido'}`)
      setLoading(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      setError('')

      let importedData: any

      // Verificar se é Excel ou JSON
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Importar Excel
        const XLSX = await import('xlsx')
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        
        // Pegar a primeira planilha
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][]
        
        // Converter estrutura Excel para formato do board
        importedData = convertExcelToBoard(jsonData, file.name.replace(/\.(xlsx|xls)$/, ''))
      } else {
        // Importar JSON
        const text = await file.text()
        importedData = JSON.parse(text)
      }

      // Para Excel, o nome já vem do convertExcelToBoard
      // Para JSON, validar estrutura
      if (!importedData.name) {
        throw new Error('Formato de arquivo inválido. O arquivo deve conter um nome.')
      }

      const { getDefaultUserId } = await import('@/lib/utils')
      const defaultUserId = getDefaultUserId()

      // Criar o board (sem type - campo será adicionado depois da migration)
      const { data: boardData, error: boardError } = await supabase
        .from('boards')
        .insert([
          {
            name: importedData.name,
            description: importedData.description || null,
            workspace_id: workspaceId,
            user_id: defaultUserId,
          },
        ])
        .select()
        .single()

      if (boardError || !boardData) {
        throw new Error(`Erro ao criar board: ${boardError?.message}`)
      }

      // Se tiver colunas, importá-las
      if (importedData.columns && Array.isArray(importedData.columns)) {
        const columnMap = new Map<string, string>() // Mapear nome da coluna para ID

        for (const col of importedData.columns) {
          const { data: colData, error: colError } = await supabase
            .from('columns')
            .insert({
              name: col.name,
              board_id: boardData.id,
              type: col.type || 'text',
              position: col.position || 0,
              settings: col.settings || {},
            })
            .select()
            .single()

          if (!colError && colData) {
            columnMap.set(col.name, colData.id)
          }
        }

        // Atualizar columnValues para usar IDs reais
        if (importedData.groups && Array.isArray(importedData.groups)) {
          for (const group of importedData.groups) {
            if (group.items && Array.isArray(group.items)) {
              for (const item of group.items) {
                if (item.columnValues && Array.isArray(item.columnValues)) {
                  // Converter columnValues para usar IDs
                  item.columnValues = item.columnValues.map((cv: any) => ({
                    ...cv,
                    column_id: columnMap.get(cv.column_name)
                  })).filter((cv: any) => cv.column_id)
                }
              }
            }
          }
        }
      }

      // Se tiver grupos e itens, importá-los
      if (importedData.groups && Array.isArray(importedData.groups)) {
        for (const group of importedData.groups) {
          const { data: groupData, error: groupError } = await supabase
            .from('groups')
            .insert({
              name: group.name,
              board_id: boardData.id,
              position: group.position || 0,
              is_collapsed: group.is_collapsed || false,
            })
            .select()
            .single()

          if (groupError || !groupData) continue

          // Importar itens do grupo
          if (group.items && Array.isArray(group.items)) {
            for (const item of group.items) {
              const { data: itemData, error: itemError } = await supabase
                .from('items')
                .insert({
                  name: item.name,
                  group_id: groupData.id,
                  position: item.position || 0,
                  user_id: defaultUserId,
                })
                .select()
                .single()

              if (itemError || !itemData) continue

              // Importar valores das colunas
              if (item.columnValues && Array.isArray(item.columnValues)) {
                for (const colValue of item.columnValues) {
                  if (colValue.column_id) {
                    await supabase.from('column_values').insert({
                      item_id: itemData.id,
                      column_id: colValue.column_id,
                      value: colValue.value,
                    })
                  }
                }
              }

              // Importar subitens
              if (item.subitems && Array.isArray(item.subitems)) {
                for (const subitem of item.subitems) {
                  await supabase.from('subitems').insert({
                    name: subitem.name,
                    item_id: itemData.id,
                    position: subitem.position || 0,
                    is_completed: subitem.is_completed || false,
                  })
                }
              }
            }
          }
        }
      }

      router.push(`/workspaces/${workspaceId}/boards/${boardData.id}`)
      router.refresh()
    } catch (err: any) {
      console.error('Error importing:', err)
      setError(`Erro ao importar: ${err.message || 'Formato de arquivo inválido'}`)
      setLoading(false)
    }

    // Reset file input
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-[#0F1711]" style={{ backgroundImage: 'radial-gradient(at 0% 0%, rgba(199, 157, 69, 0.08) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(33, 47, 35, 0.2) 0%, transparent 50%)' }}>
      <nav className="bg-[#1A2A1D] border-b border-[rgba(199,157,69,0.2)] px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <div className="relative w-40 h-12 flex-shrink-0 logo-container">
              <Image
                src="/logovestoappk.png"
                alt="VESTO co."
                fill
                className="object-contain logo-image"
                priority
                unoptimized
              />
            </div>
          </Link>
          <button
            onClick={() => workspaceId && router.push(`/workspaces/${workspaceId}`)}
            className="flex items-center gap-2 text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-[rgba(255,255,255,0.95)] mb-2 font-main">
          Novo Quadro
        </h2>
        <p className="text-[rgba(255,255,255,0.5)] mb-8">
          Escolha o tipo de quadro que deseja criar
        </p>

        {/* Tipo de Quadro */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-3 uppercase tracking-wide">
            Tipo de Quadro
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setBoardType('board')}
              className={`p-6 rounded-lg border-2 transition-all ${
                boardType === 'board'
                  ? 'border-[#C79D45] bg-[rgba(199,157,69,0.15)]'
                  : 'border-[rgba(199,157,69,0.2)] bg-[rgba(26,42,29,0.7)] hover:border-[rgba(199,157,69,0.4)]'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <LayoutDashboard 
                  size={32} 
                  className={boardType === 'board' ? 'text-[#C79D45]' : 'text-[rgba(255,255,255,0.5)]'} 
                />
                <div className="text-center">
                  <div className={`font-semibold mb-1 ${boardType === 'board' ? 'text-[rgba(255,255,255,0.95)]' : 'text-[rgba(255,255,255,0.7)]'}`}>
                    Quadro
                  </div>
                  <div className="text-xs text-[rgba(255,255,255,0.5)]">
                    Com grupos e colunas
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setBoardType('document')}
              className={`p-6 rounded-lg border-2 transition-all ${
                boardType === 'document'
                  ? 'border-[#C79D45] bg-[rgba(199,157,69,0.15)]'
                  : 'border-[rgba(199,157,69,0.2)] bg-[rgba(26,42,29,0.7)] hover:border-[rgba(199,157,69,0.4)]'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <FileText 
                  size={32} 
                  className={boardType === 'document' ? 'text-[#C79D45]' : 'text-[rgba(255,255,255,0.5)]'} 
                />
                <div className="text-center">
                  <div className={`font-semibold mb-1 ${boardType === 'document' ? 'text-[rgba(255,255,255,0.95)]' : 'text-[rgba(255,255,255,0.7)]'}`}>
                    Documento
                  </div>
                  <div className="text-xs text-[rgba(255,255,255,0.5)]">
                    Como "Links Úteis"
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Opção de Importar */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-3 uppercase tracking-wide">
            Ou importe um quadro
          </label>
          <label className="flex items-center justify-center gap-3 p-6 bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg border-2 border-dashed border-[rgba(199,157,69,0.3)] hover:border-[rgba(199,157,69,0.5)] cursor-pointer transition-all">
            <Upload size={20} className="text-[#C79D45]" />
            <span className="text-[rgba(255,255,255,0.95)] font-medium">Importar Quadro (Excel/JSON)</span>
            <input
              type="file"
              accept=".xlsx,.xls,.json"
              onChange={handleImport}
              className="hidden"
              disabled={loading}
            />
          </label>
          <p className="text-xs text-[rgba(255,255,255,0.5)] mt-2 text-center">
            Selecione um arquivo Excel (.xlsx, .xls) ou JSON exportado de outro quadro
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[rgba(26,42,29,0.7)] backdrop-blur-xl rounded-lg border border-[rgba(199,157,69,0.2)] p-6 space-y-6 shadow-lg">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2 uppercase tracking-wide">
              Nome *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(199,157,69,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45] transition-all input-white-text"
              placeholder={boardType === 'document' ? 'Ex: Links Úteis' : 'Ex: Web Designer - Clientes'}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'rgba(255, 255, 255, 0.95)'
              } as React.CSSProperties}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'
                e.target.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important')
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'
                e.target.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important')
              }}
              onInput={(e) => {
                e.currentTarget.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important')
              }}
              onKeyDown={(e) => {
                e.currentTarget.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important')
              }}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2 uppercase tracking-wide">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-[rgba(199,157,69,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C79D45] focus:border-[#C79D45] transition-all resize-none input-white-text"
              placeholder="Descrição opcional"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'rgba(255, 255, 255, 0.95)'
              } as React.CSSProperties}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'
                e.target.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important')
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'
                e.target.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important')
              }}
              onInput={(e) => {
                e.currentTarget.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important')
              }}
              onKeyDown={(e) => {
                e.currentTarget.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important')
              }}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#C79D45] to-[#D4AD5F] text-[#0F1711] px-6 py-3 rounded-lg hover:from-[#D4AD5F] hover:to-[#E5C485] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-[0_4px_16px_rgba(199,157,69,0.25)]"
            >
              {loading ? 'Criando...' : `Criar ${boardType === 'document' ? 'Documento' : 'Quadro'}`}
            </button>
            <button
              type="button"
              onClick={() => workspaceId && router.push(`/workspaces/${workspaceId}`)}
              className="px-6 py-3 bg-[rgba(0,0,0,0.2)] text-[rgba(255,255,255,0.7)] rounded-lg hover:bg-[rgba(0,0,0,0.3)] hover:text-[rgba(255,255,255,0.95)] transition-all border border-[rgba(199,157,69,0.2)]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

