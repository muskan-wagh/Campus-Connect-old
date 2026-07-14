import { createSupabaseServer, getUserProfile } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
        <div className="group rounded-2xl border border-border bg-card p-6 hover:shadow-sm hover:border-foreground/20 transition-all duration-300">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] leading-none mb-1">
            {stats.eventsCount}
          </div>
          <div className="text-sm text-muted-foreground">Active Events</div>
        </div>
        <div className="group rounded-2xl border border-border bg-card p-6 hover:shadow-sm hover:border-foreground/20 transition-all duration-300">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] leading-none mb-1">
            {stats.clubsCount}
          </div>
          <div className="text-sm text-muted-foreground">Active Clubs</div>
        </div>
        <div className="group rounded-2xl border border-border bg-card p-6 hover:shadow-sm hover:border-foreground/20 transition-all duration-300">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Users className="h-5 w-5" />
          </div>
          <div className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] leading-none mb-1">
            {memberships.length}
          </div>
          <div className="text-sm text-muted-foreground">My Clubs</div>
        </div>
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
              <Link key={event.id} href={`/dashboard/events/${event.id}`} className="group block">
                <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-sm hover:border-foreground/20 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-muted border overflow-hidden flex items-center justify-center shrink-0">
                      {event.clubs?.logo_url ? (
                        <img src={event.clubs.logo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{event.clubs?.name}</span>
                  </div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-1 group-hover:text-foreground transition-colors">{event.title}</h3>
                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{event.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                    <span className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleDateString()}</span>
                    {event.location && (
                      <span className="text-xs text-muted-foreground truncate ml-2">{event.location}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {events.length === 0 && (
              <div className="col-span-2 text-center py-16">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-4">
                  <CalendarDays className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No upcoming events. Check back soon!</p>
              </div>
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
                      <div className="h-10 w-10 rounded-xl bg-muted border overflow-hidden flex items-center justify-center shrink-0">
                        {m.clubs?.logo_url ? (
                          <img src={m.clubs.logo_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground">{m.clubs?.name?.[0]}</span>
                        )}
                      </div>
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
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-4">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">You haven&apos;t joined any clubs yet.</p>
              <Link href="/dashboard/clubs">
                <Button variant="outline" size="sm">Browse clubs</Button>
              </Link>
            </div>
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
