'use client'

import { Column } from '@/types'
import StatusCell from './StatusCell'
import PersonCell from './PersonCell'
import PriorityCell from './PriorityCell'
import DateCell from './DateCell'
import TimeTrackingCell from './TimeTrackingCell'

interface ColumnCellProps {
  column: Column
  value: any
  itemId: string
  onChange: (value: any) => void
}

export default function ColumnCell({ column, value, itemId, onChange }: ColumnCellProps) {
  switch (column.type) {
    case 'status':
      return <StatusCell value={value} onChange={onChange} />
    case 'person':
      return <PersonCell value={value} onChange={onChange} />
    case 'priority':
      return <PriorityCell value={value} onChange={onChange} />
    case 'date':
      return <DateCell value={value} onChange={onChange} />
    case 'time_tracking':
      return <TimeTrackingCell itemId={itemId} value={value} onChange={onChange} />
    default:
      return (
        <div className="text-sm text-gray-600">
          {value || '-'}
        </div>
      )
  }
}

