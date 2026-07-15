import { cn } from '@/lib/utils'

export function EmptyState({ icon: Icon, title, message, action, className }) {
  return (
    <div className={cn('col-span-full text-center py-16', className)}>
      {Icon && (
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
