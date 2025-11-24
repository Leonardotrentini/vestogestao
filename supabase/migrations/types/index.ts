export interface Workspace {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface Board {
  id: string
  name: string
  description?: string
  workspace_id: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface Group {
  id: string
  name: string
  board_id: string
  position: number
  is_collapsed: boolean
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  name: string
  group_id: string
  position: number
  created_at: string
  updated_at: string
  user_id?: string
}

export interface Subitem {
  id: string
  name: string
  item_id: string
  position: number
  is_completed: boolean
  created_at: string
  updated_at: string
}

export type ColumnType = 
  | 'text'
  | 'status'
  | 'person'
  | 'priority'
  | 'date'
  | 'number'
  | 'checkbox'
  | 'time_tracking'
  | 'currency'
  | 'link'
  | 'long_text'

export interface Column {
  id: string
  name: string
  board_id: string
  type: ColumnType
  position: number
  settings?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ColumnValue {
  id: string
  item_id: string
  column_id: string
  value: any
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  item_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface TimeTracking {
  id: string
  item_id: string
  user_id: string
  start_time: string
  end_time?: string
  duration_seconds?: number
  created_at: string
}

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

