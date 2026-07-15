import { createSupabaseServer } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { EventCard } from '@/components/ui/event-card'
import { EmptyState } from '@/components/ui/empty-state'

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
          <EventCard key={event.id} event={event} href={`/dashboard/events/${event.id}`} />
        ))}
        {(!events || events.length === 0) && (
          <EmptyState message="No events yet." />
        )}
      </div>
    </div>
  )
}
