'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface UserPerformanceChartProps {
  data: Array<{
    userId: string
    userName: string
    tasksCompleted: number
    hoursWorked: number
    completionRate: number
  }>
}

export default function UserPerformanceChart({ data }: UserPerformanceChartProps) {
  const chartData = data.map(item => ({
    name: item.userName.split(' ')[0] || 'Usuário', // Primeiro nome apenas
    'Tarefas Completadas': item.tasksCompleted,
    'Horas Trabalhadas': Math.round(item.hoursWorked),
    'Taxa de Conclusão': Math.round(item.completionRate)
  }))

  return (
    <div className="bg-[#1A2A1D] rounded-lg border border-[rgba(199,157,69,0.3)] p-4">
      <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-4">
        Performance da Equipe
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(199,157,69,0.2)" />
          <XAxis 
            dataKey="name" 
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
          <Bar 
            dataKey="Tarefas Completadas" 
            fill="#C79D45"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


