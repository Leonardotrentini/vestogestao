'use client'

import { Trophy, Medal, Award, User } from 'lucide-react'

interface UserRank {
  userId: string
  userName: string
  userEmail: string
  score: number
  tasksCompleted: number
  completionRate: number
  rank: number
}

interface PerformanceRankingProps {
  users: UserRank[]
  title?: string
}

export default function PerformanceRanking({ users, title = 'Ranking de Performance' }: PerformanceRankingProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-400" size={20} />
      case 2:
        return <Medal className="text-gray-300" size={20} />
      case 3:
        return <Award className="text-amber-600" size={20} />
      default:
        return <span className="text-sm font-bold text-[rgba(255,255,255,0.7)] w-6 text-center">{rank}</span>
    }
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border-yellow-500/30'
      case 2:
        return 'bg-gradient-to-r from-gray-500/20 to-gray-700/20 border-gray-400/30'
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-500/30'
      default:
        return 'bg-[rgba(199,157,69,0.05)] border-[rgba(199,157,69,0.2)]'
    }
  }

  return (
    <div className="bg-[#1A2A1D] rounded-lg border border-[rgba(199,157,69,0.3)] p-4">
      <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.95)] mb-4">
        {title}
      </h3>
      <div className="space-y-2">
        {users.length === 0 ? (
          <p className="text-center text-[rgba(255,255,255,0.5)] py-8">
            Nenhum dado disponível
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.userId}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${getRankBg(user.rank)}`}
            >
              <div className="flex-shrink-0">
                {getRankIcon(user.rank)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#C79D45] flex items-center justify-center text-sm font-medium text-[#0F1711]">
                    {user.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[rgba(255,255,255,0.95)] truncate">
                      {user.userName}
                    </p>
                    <p className="text-xs text-[rgba(255,255,255,0.5)] truncate">
                      {user.userEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-xs text-[rgba(255,255,255,0.5)]">Tarefas</p>
                  <p className="text-sm font-semibold text-[rgba(255,255,255,0.95)]">
                    {user.tasksCompleted}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[rgba(255,255,255,0.5)]">Taxa</p>
                  <p className="text-sm font-semibold text-[#C79D45]">
                    {user.completionRate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[rgba(255,255,255,0.5)]">Score</p>
                  <p className="text-sm font-semibold text-[rgba(255,255,255,0.95)]">
                    {user.score}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


