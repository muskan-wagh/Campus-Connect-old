'use client'

import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

export function Dialog({ open, onOpenChange, children }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => onOpenChange?.(false)}
          />
          <div className="relative z-50 animate-scale-in">{children}</div>
        </div>
      )}
    </>
  )
}

export function DialogContent({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-background rounded-xl border shadow-lg max-w-lg w-full mx-4 p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)} {...props} />
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}
