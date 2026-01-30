// Helper para obter a largura de uma coluna
export function getColumnWidth(column: { width?: number; settings?: any }, defaultWidth: number = 160): number {
  if (column.width) {
    return column.width
  }
  
  if (column.settings && typeof column.settings === 'object' && column.settings.width) {
    return column.settings.width
  }
  
  return defaultWidth
}











