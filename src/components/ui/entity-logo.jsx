import { cn } from '@/lib/utils'

const boxSizes = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-20 w-20',
}

const textSizes = {
  sm: 'text-[10px]',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-2xl',
}

export function EntityLogo({ src, name, size = 'md', className }) {
  const initial = name?.[0] || '?'
  return (
    <div
      className={cn(
        'rounded-lg bg-muted border overflow-hidden flex items-center justify-center shrink-0',
        boxSizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className={cn('font-medium text-muted-foreground', textSizes[size])}>
          {initial}
        </span>
      )}
    </div>
  )
}
