export interface ImportBriefing {
  summary: string
  dataType: string
  grouping: {
    strategy: 'by_column' | 'single_group'
    byColumn?: string
    defaultGroup?: string
  }
  suggestedColumns: Array<{
    name: string
    type: 'text' | 'status' | 'number' | 'currency' | 'date' | 'person' | 'priority' | 'link'
    description: string
  }>
  visualizations: Array<{
    type: 'pie' | 'bar' | 'line' | 'table' | 'metric'
    title: string
    description: string
    dataSource: string
  }>
  recommendations: string[]
}

export interface ExcelStructure {
  headers: string[]
  rowCount: number
  sampleRows: any[][]
  fileInfo: {
    name: string
    sheetName: string
  }
}

