'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDuration } from '@/lib/utils'
import { Play, Square } from 'lucide-react'

interface TimeTrackingCellProps {
  itemId: string
  value?: any
  onChange: (value: any) => void
}

export default function TimeTrackingCell({ itemId, value, onChange }: TimeTrackingCellProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [baseSeconds, setBaseSeconds] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [currentStart, setCurrentStart] = useState<Date | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadTimeTracking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && currentStart) {
      interval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - currentStart.getTime()) / 1000)
        setElapsedSeconds(elapsed)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, currentStart])

  const totalSeconds = baseSeconds + elapsedSeconds

  useEffect(() => {
    if (totalSeconds > 0) {
      onChange(totalSeconds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds])

  const loadTimeTracking = async () => {
    const { data } = await supabase
      .from('time_tracking')
      .select('*')
      .eq('item_id', itemId)

    let total = 0
    let activeStartDate: Date | null = null

    data?.forEach((track) => {
      if (track.end_time) {
        total += track.duration_seconds || 0
      } else {
        // Tempo em andamento
        activeStartDate = new Date(track.start_time)
        const start = activeStartDate.getTime()
        const now = new Date().getTime()
        total += Math.floor((now - start) / 1000)
      }
    })

    if (activeStartDate !== null) {
      const startTime = (activeStartDate as Date).getTime()
      const base = total - Math.floor((new Date().getTime() - startTime) / 1000)
      const elapsed = Math.floor((new Date().getTime() - startTime) / 1000)
      setBaseSeconds(Math.max(0, base))
      setElapsedSeconds(elapsed)
      setIsRunning(true)
      setCurrentStart(activeStartDate)
    } else {
      setBaseSeconds(total)
      setElapsedSeconds(0)
      setIsRunning(false)
      setCurrentStart(null)
    }
  }

  const handleStart = async () => {
    const { getDefaultUserId } = await import('@/lib/utils')
    const defaultUserId = getDefaultUserId()

    const { data } = await supabase
      .from('time_tracking')
      .insert({
        item_id: itemId,
        user_id: defaultUserId,
        start_time: new Date().toISOString(),
      })
      .select()
      .single()

    if (data) {
      const start = new Date()
      setIsRunning(true)
      setCurrentStart(start)
      setElapsedSeconds(0)
    }
  }

  const handleStop = async () => {
    const { getDefaultUserId } = await import('@/lib/utils')
    const defaultUserId = getDefaultUserId()

    const { data: activeTracking } = await supabase
      .from('time_tracking')
      .select('*')
      .eq('item_id', itemId)
      .eq('user_id', defaultUserId)
      .is('end_time', null)
      .single()

    if (activeTracking && currentStart) {
      const duration = elapsedSeconds

      await supabase
        .from('time_tracking')
        .update({
          end_time: new Date().toISOString(),
          duration_seconds: duration,
        })
        .eq('id', activeTracking.id)

      setIsRunning(false)
      setCurrentStart(null)
      setBaseSeconds(baseSeconds + duration)
      setElapsedSeconds(0)
      loadTimeTracking()
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isRunning ? (
        <button
          onClick={handleStop}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
          title="Parar timer"
        >
          <Square size={16} />
        </button>
      ) : (
        <button
          onClick={handleStart}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          title="Iniciar timer"
        >
          <Play size={16} />
        </button>
      )}
      <span className="text-sm text-gray-700">
        {formatDuration(totalSeconds)}
      </span>
    </div>
  )
}
