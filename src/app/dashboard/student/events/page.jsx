import { createSupabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default async function StudentEventsPage() {
  const supabase = await createSupabaseServer()
  const { data: events } = await supabase
    .from('events')
    .select('*, clubs(name, logo_url)')
    .eq('status', 'published')
    .eq('is_admin_approved', true)
    .order('created_at', { ascending: false })

  return (
    <div>
      <DashboardHeader title="Events" subtitle="Browse all campus events" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(events || []).map((event) => (
          <Link key={event.id} href={`/dashboard/events/${event.id}`}>
            <Card className="h-full hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded bg-muted border overflow-hidden flex items-center justify-center">
                    {event.clubs?.logo_url ? (
                      <img src={event.clubs.logo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-medium text-muted-foreground">{event.clubs?.name?.[0]}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{event.clubs?.name}</span>
                </div>
                <h3 className="font-medium text-sm mb-1 line-clamp-1">{event.title}</h3>
                {event.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleDateString()}</span>
                  {event.location && (
                    <Badge variant="secondary" className="text-[10px]">{event.location}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {(!events || events.length === 0) && (
          <div className="col-span-full text-center py-16 text-sm text-muted-foreground">
            No events yet.
          </div>
        )}
      </div>
    </div>
  )
}
