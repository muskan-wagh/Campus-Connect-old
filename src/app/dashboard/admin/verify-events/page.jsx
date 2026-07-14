import { createSupabaseServer } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

async function authorizeEvent(eventId) {
  'use server'
  const supabase = await createSupabaseServer()
  await supabase
    .from('events')
    .update({ is_admin_approved: true, status: 'published' })
    .eq('id', eventId)

  const { data: event } = await supabase.from('events').select('club_id').eq('id', eventId).single()
  if (event) {
    const { data: members } = await supabase
      .from('club_members')
      .select('user_id')
      .eq('club_id', event.club_id)
      .eq('role', 'lead')

    if (members) {
      for (const member of members) {
        await supabase.from('notifications').insert({
          user_id: member.user_id,
          title: 'Event Approved',
          message: 'Your event has been approved and published.',
          type: 'success',
          link: `/dashboard/events/${eventId}`,
          created_at: new Date().toISOString()
        })
      }
    }
  }
}

async function declineEvent(eventId) {
  'use server'
  const supabase = await createSupabaseServer()
  await supabase.from('events').delete().eq('id', eventId)
}

export default async function VerifyEventsPage() {
  const supabase = await createSupabaseServer()
  const { data: events } = await supabase
    .from('events')
    .select('*, clubs(name)')
    .eq('is_admin_approved', false)
    .order('created_at', { ascending: false })

  return (
    <div>
      <DashboardHeader title="Verify Events" subtitle="Approve or decline pending events" />
      <div className="grid sm:grid-cols-2 gap-4">
        {(events || []).map((event) => (
          <Card key={event.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-sm">{event.title}</h3>
                  <p className="text-xs text-muted-foreground">{event.clubs?.name}</p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
              {event.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <form action={authorizeEvent.bind(null, event.id)}>
                    <Button type="submit" size="sm" variant="outline">Approve</Button>
                  </form>
                  <form action={declineEvent.bind(null, event.id)}>
                    <Button type="submit" size="sm" variant="ghost" className="text-destructive">Decline</Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!events || events.length === 0) && (
          <div className="col-span-full text-center py-16 text-sm text-muted-foreground">
            No events pending approval.
          </div>
        )}
      </div>
    </div>
  )
}
