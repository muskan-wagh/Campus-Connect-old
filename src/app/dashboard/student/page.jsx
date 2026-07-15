import { createSupabaseServer, getUserProfile } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { EventCard } from '@/components/ui/event-card'
import { EmptyState } from '@/components/ui/empty-state'
import { EntityLogo } from '@/components/ui/entity-logo'
import { CalendarDays, Building2, Users, ArrowRight } from 'lucide-react'

const getStudentStats = unstable_cache(
  async () => {
    const supabase = await createSupabaseServer()
    if (!supabase) return { clubsCount: 0, eventsCount: 0 }

    const { count: clubsCount } = await supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('is_approved', true)
    const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published')
    return { clubsCount, eventsCount }
  },
  ['student-stats'],
  { revalidate: 60 }
)

const getUpcomingEvents = unstable_cache(
  async () => {
    const supabase = await createSupabaseServer()
    if (!supabase) return []

    const { data } = await supabase
      .from('events')
      .select('*, clubs(name, logo_url)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(6)
    return data || []
  },
  ['student-upcoming-events'],
  { revalidate: 30 }
)

const getMyMemberships = unstable_cache(
  async (userId) => {
    const supabase = await createSupabaseServer()
    if (!supabase) return []

    const { data } = await supabase
      .from('club_members')
      .select('*, clubs(id, name, logo_url)')
      .eq('user_id', userId)
    return data || []
  },
  ['my-memberships'],
  { revalidate: 60 }
)

export default async function StudentDashboard() {
  const { user } = await getUserProfile()
  const stats = await getStudentStats()
  const events = await getUpcomingEvents()
  const memberships = await getMyMemberships(user.id)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Welcome back! Here&apos;s what&apos;s happening on campus.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="Active Events" value={stats.eventsCount} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={Building2} label="Active Clubs" value={stats.clubsCount} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Users} label="My Clubs" value={memberships.length} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <Link href="/dashboard/student/events">
              <Button variant="ghost" size="sm" className="gap-1.5">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} href={`/dashboard/events/${event.id}`} />
            ))}
            {events.length === 0 && (
              <EmptyState
                className="col-span-2"
                icon={CalendarDays}
                title="No upcoming events"
                message="Check back soon!"
              />
            )}
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="text-lg font-semibold">My Clubs</h2>
          {memberships.length > 0 ? (
            <div className="space-y-3">
              {memberships.map((m) => (
                <Link key={m.club_id} href={`/dashboard/clubs/${m.club_id}`} className="group block">
                  <div className="rounded-2xl border border-border bg-card p-4 hover:shadow-sm hover:border-foreground/20 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <EntityLogo src={m.clubs?.logo_url} name={m.clubs?.name} size="md" className="rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate group-hover:text-foreground transition-colors">{m.clubs?.name}</p>
                        <Badge variant="secondary" className="capitalize mt-1">{m.role}</Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="No clubs yet"
              message="You haven&apos;t joined any clubs yet."
              action={
                <Link href="/dashboard/clubs">
                  <Button variant="outline" size="sm">Browse clubs</Button>
                </Link>
              }
            />
          )}

          <Link href="/dashboard/clubs">
            <Button variant="outline" className="w-full gap-1.5">
              Browse all clubs <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
