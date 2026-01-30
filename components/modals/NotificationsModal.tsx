'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Bell } from 'lucide-react'

interface NotificationsModalProps {
  workspaceId: string
  onClose: () => void
}

export default function NotificationsModal({ workspaceId, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadNotifications()
    
    // Subscribe to notification changes
    const channel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications'
      }, () => {
        loadNotifications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workspaceId])

  const loadNotifications = async () => {
    const { getDefaultUserId } = await import('@/lib/utils')
    const defaultUserId = getDefaultUserId()

    const { data } = await supabase
      .from('notifications')
      .select('*, boards(id, name)')
      .eq('user_id', defaultUserId)
      .order('created_at', { ascending: false })
      .limit(50)

    setNotifications(data || [])
    setLoading(false)
  }

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    
    loadNotifications()
  }

  const markAllAsRead = async () => {
    const { getDefaultUserId } = await import('@/lib/utils')
    const defaultUserId = getDefaultUserId()

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', defaultUserId)
      .eq('is_read', false)
    
    loadNotifications()
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div 
          className="bg-[#1A2A1D] rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-[rgba(199,157,69,0.3)] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[rgba(199,157,69,0.2)]">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-[#C79D45]" />
              <h2 className="text-lg font-semibold text-[rgba(255,255,255,0.95)]">
                Notificações
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-[#C79D45] text-[#0F1711] text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1 text-xs text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] hover:bg-[rgba(199,157,69,0.1)] rounded transition-colors"
                >
                  Marcar todas como lidas
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-[rgba(199,157,69,0.1)] rounded text-[rgba(255,255,255,0.7)] hover:text-[rgba(255,255,255,0.95)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center text-[rgba(255,255,255,0.7)] py-8">
                Carregando...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center text-[rgba(255,255,255,0.7)] py-8">
                <Bell size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      notification.is_read
                        ? 'bg-[rgba(0,0,0,0.2)] border-[rgba(199,157,69,0.1)]'
                        : 'bg-[rgba(199,157,69,0.1)] border-[rgba(199,157,69,0.3)]'
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-[rgba(255,255,255,0.95)]">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-[#C79D45] rounded-full"></span>
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-xs text-[rgba(255,255,255,0.7)] mb-1">
                            {notification.message}
                          </p>
                        )}
                        {notification.boards && (
                          <p className="text-xs text-[rgba(255,255,255,0.5)]">
                            {notification.boards.name}
                          </p>
                        )}
                        <p className="text-xs text-[rgba(255,255,255,0.5)] mt-1">
                          {new Date(notification.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}











