'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface LogoProps {
  className?: string
  showText?: boolean
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  const pathname = usePathname()
  const [imageError, setImageError] = useState(false)
  
  // Determinar se estamos em uma página de board para linkar de volta
  const isBoardPage = pathname?.includes('/boards/')
  const workspaceId = pathname?.split('/workspaces/')[1]?.split('/')[0]

  const logoContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      {!imageError ? (
        <div className="relative w-40 h-12 flex-shrink-0 logo-container">
          <Image
            src="/logovestoappk.png"
            alt="VESTO co."
            fill
            className="object-contain logo-image"
            priority
            unoptimized
            onError={() => {
              setImageError(true)
            }}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* Fallback: Ícone estilizado com cores da marca */}
          <div className="w-8 h-8 bg-gradient-to-br from-green-700 to-green-900 rounded flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white font-bold text-sm tracking-tight">V</span>
          </div>
          {showText && (
            <div className="flex flex-col">
              <span className="text-gray-900 font-semibold text-sm leading-tight tracking-tight">VESTO</span>
              <span className="text-gray-500 text-xs leading-tight">co.</span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (isBoardPage && workspaceId) {
    return (
      <Link href={`/workspaces/${workspaceId}`} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    )
  }

  return (
    <Link href="/" className="hover:opacity-80 transition-opacity">
      {logoContent}
    </Link>
  )
}

