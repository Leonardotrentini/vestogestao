'use client'

import { useState, useCallback, type ReactNode } from 'react'
import Sidebar from '@/components/layout/Sidebar'

type Props = {
  workspaceId: string
  currentBoardId?: string
  children: ReactNode
}

/**
 * Envolve Sidebar + conteúdo do quadro: a margem esquerda segue a largura real
 * da sidebar (recolhida 60px, expandida/redimensionável).
 */
export default function BoardWorkspaceLayout({
  workspaceId,
  currentBoardId,
  children,
}: Props) {
  const [sidebarInsetPx, setSidebarInsetPx] = useState(256)

  const handleInsetPxChange = useCallback((px: number) => {
    setSidebarInsetPx(px)
  }, [])

  return (
    <div className="flex min-h-screen bg-[#0F1711]">
      <Sidebar
        workspaceId={workspaceId}
        currentBoardId={currentBoardId}
        onInsetPxChange={handleInsetPxChange}
      />
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-out h-svh"
        style={{ marginLeft: sidebarInsetPx }}
      >
        {children}
      </div>
    </div>
  )
}
