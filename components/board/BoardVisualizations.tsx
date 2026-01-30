'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Item, Column, ColumnValue } from '@/supabase/migrations/types'

interface BoardVisualizationsProps {
  items: Item[]
  columns: Column[]
  columnValues: ColumnValue[]
}

export default function BoardVisualizations({ items, columns, columnValues }: BoardVisualizationsProps) {
  // Organizar valores por coluna (melhor parsing de JSONB)
  const dataByColumn = useMemo(() => {
    const map = new Map<string, Map<string, number>>()
    const valueMap = new Map<string, number>() // Para análise de valores numéricos
    
    columns.forEach(column => {
      map.set(column.id, new Map())
    })
    
    columnValues.forEach(cv => {
      const columnMap = map.get(cv.column_id)
      if (!columnMap) return
      
      // Parse JSONB value
      let value: any = cv.value
      if (typeof cv.value === 'object' && cv.value !== null) {
        // Se for objeto JSONB, tentar extrair valor
        if ('value' in cv.value) {
          value = cv.value.value
        } else if ('text' in cv.value) {
          value = cv.value.text
        } else {
          value = JSON.stringify(cv.value)
        }
      }
      
      const valueStr = String(value || '').trim()
      if (!valueStr || valueStr === '-' || valueStr === 'null' || valueStr === 'undefined') return
      
      // Normalizar valores (minúsculas para agrupar melhor)
      const normalizedValue = valueStr.toLowerCase()
      const current = columnMap.get(valueStr) || 0
      columnMap.set(valueStr, current + 1)
      
      // Tentar extrair número para análise
      const numValue = parseFloat(valueStr.replace(/[^\d.,]/g, '').replace(',', '.'))
      if (!isNaN(numValue)) {
        valueMap.set(cv.column_id, (valueMap.get(cv.column_id) || 0) + 1)
      }
    })
    
    return map
  }, [columns, columnValues])

  // Encontrar colunas numéricas/currency (ou colunas texto com valores numéricos)
  const numericColumns = useMemo(() => {
    const cols = columns.filter(col => {
      const type = col.type?.toLowerCase()
      return type === 'number' || type === 'currency'
    })
    
    // Se não encontrou, procurar colunas que podem ter números no nome
    if (cols.length === 0) {
      for (const col of columns) {
        const name = col.name?.toLowerCase() || ''
        if (name.includes('valor') || name.includes('custo') || name.includes('orçamento') || 
            name.includes('resultado') || name.includes('alcance') || name.includes('frequência')) {
          // Verificar se tem valores numéricos
          const columnMap = dataByColumn.get(col.id)
          if (columnMap && columnMap.size > 0) {
            const sampleValues = Array.from(columnMap.keys()).slice(0, 5)
            const numericCount = sampleValues.filter(v => {
              const num = parseFloat(String(v).replace(/[^\d.,]/g, '').replace(',', '.'))
              return !isNaN(num) && num > 0
            }).length
            if (numericCount >= 2) {
              return [col]
            }
          }
        }
      }
    }
    
    return cols
  }, [columns, dataByColumn])

  // Encontrar colunas de status (ou colunas texto com valores repetidos - como "VEICULAÇÃO DA CAMPANHA")
  const statusColumns = useMemo(() => {
    const cols = columns.filter(col => {
      const type = col.type?.toLowerCase()
      const name = col.name?.toLowerCase() || ''
      return type === 'status' || name.includes('status') || name.includes('estado') || name.includes('situação') ||
             name.includes('veiculação') || name.includes('veiculação')
    })
    
    // Se não encontrou, procurar colunas texto com poucos valores únicos (ideal para pizza)
    if (cols.length === 0) {
      for (const col of columns) {
        const columnMap = dataByColumn.get(col.id)
        if (!columnMap) continue
        
        // Se tem poucos valores únicos (2-10), é bom para gráfico de pizza
        if (columnMap.size >= 2 && columnMap.size <= 10) {
          // Verificar se não são todos numéricos
          const values = Array.from(columnMap.keys())
          const areAllNumeric = values.every(v => !isNaN(parseFloat(v.replace(/[^\d.,]/g, '').replace(',', '.'))))
          if (!areAllNumeric) {
            return [col]
          }
        }
      }
    }
    
    return cols
  }, [columns, dataByColumn])

  // Gerar dados para gráfico de pizza (status ou qualquer coluna categórica)
  const pieData = useMemo(() => {
    if (statusColumns.length === 0) return []
    
    const statusColumn = statusColumns[0]
    const columnMap = dataByColumn.get(statusColumn.id)
    if (!columnMap || columnMap.size === 0) return []
    
    // Filtrar valores muito pequenos (menos de 1% não aparece bem no gráfico)
    const total = Array.from(columnMap.values()).reduce((sum, val) => sum + val, 0)
    const minValue = Math.max(1, Math.floor(total * 0.01)) // Mínimo 1 ou 1% do total
    
    return Array.from(columnMap.entries())
      .filter(([_, value]) => value >= minValue)
      .map(([name, value]) => ({
        name: name || 'Sem valor',
        value
      }))
      .sort((a, b) => b.value - a.value) // Ordenar do maior para menor
  }, [statusColumns, dataByColumn])

  // Gerar dados para gráfico de barras (valores numéricos)
  const barData = useMemo(() => {
    if (numericColumns.length === 0) return []
    
    const numericColumn = numericColumns[0]
    const itemsMap = new Map<string, number>()
    
    items.forEach(item => {
      const cv = columnValues.find(cv => cv.item_id === item.id && cv.column_id === numericColumn.id)
      if (!cv || !cv.value) return
      
      // Parse JSONB
      let rawValue = cv.value
      if (typeof cv.value === 'object' && cv.value !== null) {
        if ('value' in cv.value) {
          rawValue = cv.value.value
        } else if ('text' in cv.value) {
          rawValue = cv.value.text
        }
      }
      
      const value = typeof rawValue === 'number' 
        ? rawValue 
        : parseFloat(String(rawValue).replace(/[^\d.,]/g, '').replace(',', '.'))
      
      if (isNaN(value) || value <= 0) return
      
      const itemName = item.name || 'Sem nome'
      const current = itemsMap.get(itemName) || 0
      itemsMap.set(itemName, current + value)
    })
    
    return Array.from(itemsMap.entries())
      .map(([name, value]) => ({ name: name.substring(0, 20), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10
  }, [numericColumns, items, columnValues])

  // Cores para gráficos
  const COLORS = ['#C79D45', '#D4AD5F', '#E5C485', '#B89035', '#A67C2A', '#957424', '#84611E', '#734E18']

  // Debug info (apenas em desenvolvimento)
  const debugInfo = process.env.NODE_ENV === 'development' && (
    <details className="mt-4 p-4 bg-[rgba(0,0,0,0.2)] rounded text-xs text-[rgba(255,255,255,0.6)]">
      <summary className="cursor-pointer mb-2">Debug Info</summary>
      <div className="space-y-1">
        <p>Colunas: {columns.length}</p>
        <p>Itens: {items.length}</p>
        <p>Valores: {columnValues.length}</p>
        <p>Status cols encontradas: {statusColumns.length}</p>
        <p>Num cols encontradas: {numericColumns.length}</p>
        <p>Pie data: {pieData.length} items</p>
        <p>Bar data: {barData.length} items</p>
      </div>
    </details>
  )

  if (pieData.length === 0 && barData.length === 0) {
    return (
      <div className="p-6 bg-[#1A2A1D] rounded-lg border border-[rgba(199,157,69,0.2)]">
        <p className="text-[rgba(255,255,255,0.7)] text-center mb-4">
          Nenhuma visualização disponível. O sistema está procurando colunas adequadas para gráficos.
        </p>
        <p className="text-[rgba(255,255,255,0.5)] text-center text-sm">
          Para ver gráficos, certifique-se de ter colunas com valores repetidos (como "Status", "Veiculação") ou valores numéricos.
        </p>
        {debugInfo}
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Gráfico de Pizza - Status */}
      {pieData.length > 0 && (
        <div className="bg-[#1A2A1D] rounded-lg border border-[rgba(199,157,69,0.2)] p-4">
          <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-4">
            Distribuição por {statusColumns[0]?.name || 'Status'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#C79D45"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A2A1D', 
                  border: '1px solid rgba(199,157,69,0.3)', 
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.95)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de Barras - Valores Numéricos */}
      {barData.length > 0 && (
        <div className="bg-[#1A2A1D] rounded-lg border border-[rgba(199,157,69,0.2)] p-4">
          <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-4">
            Top 10 - {numericColumns[0]?.name || 'Valores'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.7)" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A2A1D', 
                  border: '1px solid rgba(199,157,69,0.3)', 
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.95)'
                }}
              />
              <Bar dataKey="value" fill="#C79D45" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de Linha - Evolução Temporal (se houver coluna de data) */}
      {columns.some(col => {
        const type = col.type?.toLowerCase()
        const name = col.name?.toLowerCase() || ''
        return type === 'date' || name.includes('data') || name.includes('date')
      }) && (
        <div className="bg-[#1A2A1D] rounded-lg border border-[rgba(199,157,69,0.2)] p-4">
          <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-4">
            Evolução ao Longo do Tempo
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A2A1D', 
                  border: '1px solid rgba(199,157,69,0.3)', 
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.95)'
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#C79D45" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-[rgba(255,255,255,0.5)] mt-2 text-center">
            Configure melhorias futuras para análise temporal
          </p>
        </div>
      )}
      {debugInfo}
    </div>
  )
}

