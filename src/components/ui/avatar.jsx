'use client'

import { cn } from '@/lib/utils'

export function Avatar({ className, src, alt, fallback, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center rounded-full bg-muted overflow-hidden shrink-0', sizes[size], className)}>
      {src ? (
        <img src={src} alt={alt || ''} className="h-full w-full object-cover" />
      ) : (
        <span className="font-medium text-muted-foreground">
          {fallback || '?'}
        </span>
      )}
    </div>
  )
}
