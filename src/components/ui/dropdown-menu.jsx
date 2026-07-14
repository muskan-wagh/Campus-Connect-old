'use client'

import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

export function DropdownMenu({ children }) {
  return children
}

export function DropdownMenuTrigger({ children, asChild, className, ...props }) {
  return (
    <div className={cn('inline-block', className)} {...props}>
      {children}
    </div>
  )
}

export function DropdownMenuContent({ children, className, align = 'start', ...props }) {
  return (
    <div
      className={cn(
        'z-50 min-w-[12rem] overflow-hidden rounded-xl border bg-popover p-1 shadow-md animate-scale-in',
        align === 'end' ? 'origin-top-right' : 'origin-top-left',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({ className, ...props }) {
  return (
    <div
      className={cn(
        'relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({ className, ...props }) {
  return <div className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
}

export function DropdownMenuLabel({ className, ...props }) {
  return <div className={cn('px-3 py-2 text-sm font-semibold', className)} {...props} />
}
