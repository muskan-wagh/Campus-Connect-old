import { createSupabaseServer } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { Building2, Clock, Users } from 'lucide-react'

const getAdminStats = unstable_cache(
  async () => {
    const supabase = await createSupabaseServer()
    if (!supabase) return { clubsCount: 0, pendingClubs: 0, membersCount: 0 }

    const { count: clubsCount } = await supabase.from('clubs').select('*', { count: 'exact', head: true })
    const { count: pendingClubs } = await supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('is_approved', false)
    const { count: membersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

    return { clubsCount, pendingClubs, membersCount }
  },
  ['admin-stats'],
  { revalidate: 30 }
)

const getPendingVerifications = unstable_cache(
  async () => {
    const supabase = await createSupabaseServer()
    if (!supabase) return { clubs: [], events: [] }

    const { data: clubs } = await supabase.from('clubs').select('*').eq('is_approved', false).order('created_at', { ascending: false }).limit(10)
    const { data: events } = await supabase.from('events').select('*, clubs(name)').eq('is_admin_approved', false).order('created_at', { ascending: false }).limit(10)

    return { clubs: clubs || [], events: events || [] }
  },
  ['pending-verifications'],
  { revalidate: 15 }
)

export default async function AdminDashboard() {
  const stats = await getAdminStats()
  const { clubs: pendingClubs, events: pendingEvents } = await getPendingVerifications()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Oversee the campus platform.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard icon={Building2} label="Total Clubs" value={stats.clubsCount} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={Clock} label="Pending Review" value={stats.pendingClubs} color="bg-amber-50 text-amber-600" />
        <StatCard icon={Users} label="Members" value={stats.membersCount} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Pending Club Verifications</h2>
            <Link href="/dashboard/admin/verify-clubs">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {pendingClubs.map((club) => (
              <Link key={club.id} href={`/dashboard/admin/clubs/${club.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{club.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(club.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {pendingClubs.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  No pending verifications.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Pending Event Approvals</h2>
            <Link href="/dashboard/admin/verify-events">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {pendingEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.clubs?.name}</p>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingEvents.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  No pending event approvals.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard/admin/verified-clubs">
          <Button variant="outline">Verified clubs</Button>
        </Link>
        <Link href="/dashboard/admin/all-events">
          <Button variant="outline">All events</Button>
        </Link>
      </div>
    </div>
  )
}
