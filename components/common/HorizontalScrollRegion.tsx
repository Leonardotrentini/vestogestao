'use client'

import { useRef, useState, useCallback, useEffect, type ReactNode, type WheelEvent } from 'react'

type Props = {
  children: ReactNode
  className?: string
  /** Cor central do fade nas bordas (hex ou rgba) */
  edgeFadeFrom?: string
  /** Em cards/layouts que não são flex-1 em coluna (ex.: analytics) */
  compact?: boolean
}

/**
 * Scroll horizontal mais usável no PC: Shift + roda, deltaX de trackpad,
 * e indicadores visuais quando há mais conteúdo à esquerda/direita.
 */
export default function HorizontalScrollRegion({
  children,
  className = '',
  edgeFadeFrom = '#0F1711',
  compact = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  const updateEdges = useCallback(() => {
    const el = ref.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const overflow = scrollWidth - clientWidth > 4
    if (!overflow) {
      setEdges({ left: false, right: false })
      return
    }
    setEdges({
      left: scrollLeft > 4,
      right: scrollLeft < scrollWidth - clientWidth - 4,
    })
  }, [])

  useEffect(() => {
    updateEdges()
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => updateEdges())
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateEdges])

  const onWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      const el = ref.current
      if (!el) return
      if (el.scrollWidth <= el.clientWidth) return

      if (e.shiftKey) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
        updateEdges()
        return
      }

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 0.5) {
        e.preventDefault()
        el.scrollLeft += e.deltaX
        updateEdges()
      }
    },
    [updateEdges]
  )

  return (
    <div
      className={
        compact ? 'relative w-full min-w-0' : 'relative h-full min-h-0 min-w-0 flex-1'
      }
    >
      {edges.left && (
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-[15] w-10"
          style={{
            background: `linear-gradient(to right, ${edgeFadeFrom}, transparent)`,
          }}
          aria-hidden
        />
      )}
      {edges.right && (
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-[15] w-10"
          style={{
            background: `linear-gradient(to left, ${edgeFadeFrom}, transparent)`,
          }}
          aria-hidden
        />
      )}
      <div ref={ref} onScroll={updateEdges} onWheel={onWheel} className={className}>
        {children}
      </div>
    </div>
  )
}
