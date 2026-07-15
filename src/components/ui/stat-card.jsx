import { cn } from '@/lib/utils'

export function StatCard({ icon: Icon, label, value, color, className }) {
  return (
    <div className={cn('group rounded-2xl border border-border bg-card p-6 hover:shadow-sm hover:border-foreground/20 transition-all duration-300', className)}>
      {Icon && (
        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${color || 'bg-muted text-muted-foreground'}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] leading-none mb-1">
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
