import { createSupabaseServer, getUserProfile } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { ClubCard } from '@/components/ui/club-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Building2, CalendarCheck, Users, PlusCircle, UserPlus, Video, FolderPlus } from 'lucide-react'

const getLeadStats = unstable_cache(
  async (userId) => {
    const supabase = await createSupabaseServer()
    if (!supabase) return { clubsCount: 0, eventsCount: 0, membersCount: 0 }

    const { count: clubsCount } = await supabase
      .from('club_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', 'lead')

    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    const { count: membersCount } = await supabase
      .from('club_members')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'member')

    return { clubsCount, eventsCount, membersCount }
  },
  ['lead-stats'],
  { revalidate: 60 }
)

const getManagedClubs = unstable_cache(
  async (userId) => {
    const supabase = await createSupabaseServer()
    if (!supabase) return []

    const { data } = await supabase
      .from('club_members')
      .select('*, clubs(*)')
      .eq('user_id', userId)
      .eq('role', 'lead')
    return data || []
  },
  ['managed-clubs'],
  { revalidate: 30 }
)

export default async function LeadDashboard() {
  const { user } = await getUserProfile()
  const stats = await getLeadStats(user.id)
  const clubs = await getManagedClubs(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lead Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your clubs and events.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard icon={Building2} label="Managed Clubs" value={stats.clubsCount} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={CalendarCheck} label="Events" value={stats.eventsCount} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Users} label="Total Members" value={stats.membersCount} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Your Clubs</h2>
          {clubs.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {clubs.map(({ clubs: club }) => (
                <ClubCard key={club.id} club={club} href={`/dashboard/clubs/${club.id}`} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="No clubs yet"
              message="You don&apos;t manage any clubs yet."
              action={
                <Link href="/dashboard/lead/create-club">
                  <Button>Create a club</Button>
                </Link>
              }
            />
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
          <Link href="/dashboard/lead/create-event">
            <Button className="w-full justify-start" variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create event
            </Button>
          </Link>
          <Link href="/dashboard/lead/members">
            <Button className="w-full justify-start" variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Manage members
            </Button>
          </Link>
          <Link href="/dashboard/lead/live-events">
            <Button className="w-full justify-start" variant="outline">
              <Video className="h-4 w-4 mr-2" />
              Live events
            </Button>
          </Link>
          <Link href="/dashboard/lead/create-club">
            <Button className="w-full justify-start" variant="outline">
              <FolderPlus className="h-4 w-4 mr-2" />
              New club
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
