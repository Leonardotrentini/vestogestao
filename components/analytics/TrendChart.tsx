'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface TrendChartProps {
  data: Array<{
    period: string
    value: number
    label?: string
  }>
  title?: string
  dataKey?: string
  color?: string
}

export default function TrendChart({
  data,
  title = 'Tendência',
  dataKey = 'value',
  color = '#C79D45'
}: TrendChartProps) {
  const chartData = data.map(item => ({
    periodo: item.period,
    [dataKey]: item.value
  }))

  return (
    <div className="bg-[#1A2A1D] rounded-lg border border-[rgba(199,157,69,0.3)] p-4">
      <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(199,157,69,0.2)" />
          <XAxis 
            dataKey="periodo" 
            stroke="rgba(255,255,255,0.7)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.7)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A2A1D',
              border: '1px solid rgba(199,157,69,0.3)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.95)'
            }}
          />
          <Legend 
            wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


