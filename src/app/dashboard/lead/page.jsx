import { createSupabaseServer, getUserProfile } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Managed Clubs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.clubsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.eventsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.membersCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Your Clubs</h2>
          {clubs.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {clubs.map(({ clubs: club }) => (
                <Link key={club.id} href={`/dashboard/clubs/${club.id}`}>
                  <Card className="h-full hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-muted border overflow-hidden flex items-center justify-center shrink-0">
                          {club.logo_url ? (
                            <img src={club.logo_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground">{club.name?.[0]}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{club.name}</h3>
                          <Badge variant={club.is_approved ? 'success' : 'warning'} className="text-[10px] mt-0.5">
                            {club.is_approved ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      {club.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{club.description}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                <p>You don&apos;t manage any clubs yet.</p>
                <Link href="/dashboard/lead/create-club">
                  <Button className="mt-4">Create a club</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
          <Link href="/dashboard/lead/create-event">
            <Button className="w-full justify-start" variant="outline">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Create event
            </Button>
          </Link>
          <Link href="/dashboard/lead/members">
            <Button className="w-full justify-start" variant="outline">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage members
            </Button>
          </Link>
          <Link href="/dashboard/lead/live-events">
            <Button className="w-full justify-start" variant="outline">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Live events
            </Button>
          </Link>
          <Link href="/dashboard/lead/create-club">
            <Button className="w-full justify-start" variant="outline">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              New club
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
