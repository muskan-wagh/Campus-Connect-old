import Link from 'next/link'
import { cn } from '@/lib/utils'
import { EntityLogo } from './entity-logo'
import { Badge } from './badge'
import { Calendar } from 'lucide-react'

export function EventCard({ event, href, className, showClub = true, children }) {
  const inner = (
    <div className={cn('rounded-2xl border border-border bg-card p-5 hover:shadow-sm hover:border-foreground/20 transition-all duration-300 h-full flex flex-col', className)}>
      {showClub && (
        <div className="flex items-center gap-2 mb-3">
          <EntityLogo
            src={event.clubs?.logo_url}
            name={event.clubs?.name}
            size="sm"
          />
          <span className="text-xs text-muted-foreground truncate">
            {event.clubs?.name || 'Club'}
          </span>
        </div>
      )}
      <h3 className="font-medium text-sm mb-1 line-clamp-1">{event.title}</h3>
      {event.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{event.description}</p>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
        <span className="text-xs text-muted-foreground">
          {new Date(event.event_date || event.created_at).toLocaleDateString()}
        </span>
        {event.location && (
          <Badge variant="secondary" className="text-[10px]">{event.location}</Badge>
        )}
      </div>
      {children}
    </div>
  )

  if (href) return <Link href={href} className="group block h-full">{inner}</Link>
  return inner
}
