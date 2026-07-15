import Link from 'next/link'
import { cn } from '@/lib/utils'
import { EntityLogo } from './entity-logo'
import { Badge } from './badge'

const statusConfig = {
  approved: { variant: 'success', label: 'Verified' },
  pending: { variant: 'warning', label: 'Pending' },
}

export function ClubCard({ club, href, status, showStatus = true, children, className }) {
  const config = status || (club.is_approved ? statusConfig.approved : statusConfig.pending)

  const inner = (
    <div className={cn('rounded-2xl border border-border bg-card p-5 hover:shadow-sm hover:border-foreground/20 transition-all duration-300 h-full flex flex-col', className)}>
      <div className="flex items-center gap-3 mb-3">
        <EntityLogo src={club.logo_url} name={club.name} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm truncate">{club.name}</h3>
          {showStatus && (
            <Badge variant={config.variant} className="text-[10px] mt-0.5">{config.label}</Badge>
          )}
        </div>
      </div>
      {club.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{club.description}</p>
      )}
      {children}
    </div>
  )

  if (href) return <Link href={href} className="group block h-full">{inner}</Link>
  return inner
}
