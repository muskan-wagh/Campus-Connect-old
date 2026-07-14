import { createSupabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default async function AllEventsPage() {
  const supabase = await createSupabaseServer()
  const { data: events } = await supabase
    .from('events')
    .select('*, clubs(name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <DashboardHeader title="All Events" subtitle="View all events on the platform" />
      <div className="space-y-3">
        {(events || []).map((event) => (
          <Card key={event.id}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">{event.title}</h3>
                  <Badge variant={
                    event.status === 'published' ? 'success' :
                    event.status === 'draft' ? 'warning' : 'destructive'
                  } className="text-[10px]">
                    {event.status}
                  </Badge>
                  {event.is_admin_approved ? (
                    <Badge variant="success" className="text-[10px]">Approved</Badge>
                  ) : (
                    <Badge variant="warning" className="text-[10px]">Unapproved</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {event.clubs?.name} &middot; {new Date(event.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Link href={`/dashboard/events/${event.id}`}>
                  <Button size="sm" variant="ghost">Details</Button>
                </Link>
                {!event.is_admin_approved && (
                  <Link href="/dashboard/admin/verify-events">
                    <Button size="sm" variant="outline">Review</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {(!events || events.length === 0) && (
          <div className="text-center py-16 text-sm text-muted-foreground">
            No events found.
          </div>
        )}
      </div>
    </div>
  )
}
