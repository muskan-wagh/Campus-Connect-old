import { cn } from '@/lib/utils'

const variants = {
  error: 'bg-destructive/5 border-destructive/10 text-destructive',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900',
  info: 'bg-primary/5 border-primary/10 text-foreground',
}

export function Alert({ variant = 'info', className, children }) {
  if (!children) return null
  return (
    <div className={cn('rounded-lg border p-3 text-sm', variants[variant], className)}>
      {children}
    </div>
  )
}
