import { createSupabaseServer } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { Avatar } from '@/components/ui/avatar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { ClubCard } from '@/components/ui/club-card'
import { EmptyState } from '@/components/ui/empty-state'

const getClubs = unstable_cache(
  async () => {
    const supabase = await createSupabaseServer()
    if (!supabase) return []

    const { data } = await supabase
      .from('clubs')
      .select('*, club_members!inner(profiles(full_name, avatar_url), role)')
      .order('created_at', { ascending: false })

    return data || []
  },
  ['clubs-list'],
  { revalidate: 30 }
)

export default async function ClubsPage() {
  const clubs = await getClubs()

  return (
    <div>
      <DashboardHeader title="Clubs" subtitle="Browse all campus clubs" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club) => {
          const leads = club.club_members?.filter((m) => m.role === 'lead') || []
          return (
            <ClubCard key={club.id} club={club} href={`/dashboard/clubs/${club.id}`}>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  {leads.slice(0, 3).map((lead, i) => (
                    <Avatar
                      key={i}
                      src={lead.profiles?.avatar_url}
                      fallback={lead.profiles?.full_name?.[0]}
                      size="sm"
                      className="ring-2 ring-background -ml-1 first:ml-0"
                    />
                  ))}
                  {leads.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{leads.length - 3}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {club.club_members?.length || 0} members
                </span>
              </div>
            </ClubCard>
          )
        })}
        {clubs.length === 0 && (
          <EmptyState message="No clubs yet." />
        )}
      </div>
    </div>
  )
}
