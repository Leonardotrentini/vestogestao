'use client'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export default function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-[rgba(199,157,69,0.1)] rounded'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

// Skeleton específico para linha de item
export function ItemRowSkeleton() {
  return (
    <div className="flex min-w-max border-b border-[rgba(199,157,69,0.2)]">
      <div className="w-8 flex-shrink-0 px-2 py-2 border-r border-[rgba(199,157,69,0.2)]">
        <Skeleton variant="rectangular" width={16} height={16} className="rounded" />
      </div>
      <div className="w-64 flex-shrink-0 px-3 py-2 border-r border-[rgba(199,157,69,0.2)]">
        <Skeleton variant="text" width="80%" height={16} />
      </div>
      <div className="flex-shrink-0 px-3 py-2 border-r border-[rgba(199,157,69,0.2)]" style={{ width: '150px' }}>
        <Skeleton variant="text" width="60%" height={16} />
      </div>
      <div className="flex-shrink-0 px-3 py-2 border-r border-[rgba(199,157,69,0.2)]" style={{ width: '120px' }}>
        <Skeleton variant="text" width="70%" height={16} />
      </div>
    </div>
  )
}

// Skeleton para grupos
export function GroupSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-12 bg-[rgba(199,157,69,0.05)] border-b border-[rgba(199,157,69,0.2)] flex items-center px-4">
        <Skeleton variant="text" width="150px" height={20} />
      </div>
      <ItemRowSkeleton />
      <ItemRowSkeleton />
      <ItemRowSkeleton />
    </div>
  )
}

