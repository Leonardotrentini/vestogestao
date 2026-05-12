'use client'

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type WheelEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'

type Props = {
  children: ReactNode
  className?: string
  /** Cor central do fade nas bordas (hex ou rgba) */
  edgeFadeFrom?: string
  /** Em cards/layouts que não são flex-1 em coluna (ex.: analytics) */
  compact?: boolean
}

/**
 * Scroll horizontal mais usável no PC:
 * - Shift + roda, deltaX de trackpad
 * - Arrastar para pan: botão do meio do rato, ou Alt + botão esquerdo (só scroll, não move itens)
 * - Indicadores visuais quando há mais conteúdo à esquerda/direita
 */
export default function HorizontalScrollRegion({
  children,
  className = '',
  edgeFadeFrom = '#0F1711',
  compact = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })
  const [isPointerPanning, setIsPointerPanning] = useState(false)
  const panPointerId = useRef<number | null>(null)
  const lastPanClientX = useRef(0)

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

  const shouldIgnorePanTarget = useCallback((target: EventTarget | null) => {
    if (!(target instanceof Element)) return false
    return !!target.closest(
      [
        'input',
        'textarea',
        'select',
        'button',
        '[contenteditable="true"]',
        'a[href]',
        '[data-column-resize-handle]',
        '[role="combobox"]',
        '[role="listbox"]',
        '[role="slider"]',
      ].join(', ')
    )
  }, [])

  const endPointerPan = useCallback(() => {
    const id = panPointerId.current
    panPointerId.current = null
    setIsPointerPanning(false)
    document.body.style.removeProperty('user-select')
    if (id != null && ref.current) {
      try {
        ref.current.releasePointerCapture(id)
      } catch {
        /* já libertado */
      }
    }
  }, [])

  const onPointerDownCapture = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = ref.current
      if (!el || el.scrollWidth <= el.clientWidth + 2) return
      if (e.pointerType !== 'mouse') return

      const middle = e.button === 1
      const altLeft = e.button === 0 && e.altKey
      if (!middle && !altLeft) return
      if (shouldIgnorePanTarget(e.target)) return

      e.preventDefault()
      panPointerId.current = e.pointerId
      lastPanClientX.current = e.clientX
      setIsPointerPanning(true)
      document.body.style.userSelect = 'none'
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        endPointerPan()
      }
    },
    [shouldIgnorePanTarget, endPointerPan]
  )

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (panPointerId.current !== e.pointerId) return
      const el = ref.current
      if (!el) return
      const dx = e.clientX - lastPanClientX.current
      lastPanClientX.current = e.clientX
      el.scrollLeft -= dx
      updateEdges()
    },
    [updateEdges]
  )

  const onPointerUpOrCancel = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (panPointerId.current !== e.pointerId) return
      endPointerPan()
    },
    [endPointerPan]
  )

  const onLostPointerCapture = useCallback(() => {
    if (panPointerId.current != null) {
      panPointerId.current = null
      setIsPointerPanning(false)
      document.body.style.removeProperty('user-select')
    }
  }, [])

  useEffect(() => {
    return () => {
      if (panPointerId.current != null) {
        document.body.style.removeProperty('user-select')
      }
    }
  }, [])

  return (
    <div
      className={
        compact
          ? 'relative w-full min-w-0'
          : 'relative flex h-full min-h-0 min-w-0 flex-1 flex-col'
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
      <div
        ref={ref}
        onScroll={updateEdges}
        onWheel={onWheel}
        onPointerDownCapture={onPointerDownCapture}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUpOrCancel}
        onPointerCancel={onPointerUpOrCancel}
        onLostPointerCapture={onLostPointerCapture}
        className={`min-h-0 ${isPointerPanning ? 'cursor-grabbing' : ''} ${className}`.trim()}
      >
        {children}
      </div>
    </div>
  )
}
