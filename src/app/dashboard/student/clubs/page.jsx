import { createSupabaseServer } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { ClubCard } from '@/components/ui/club-card'
import { EmptyState } from '@/components/ui/empty-state'

export default async function StudentClubsPage() {
  const supabase = await createSupabaseServer()
  const { data: clubs } = await supabase
    .from('clubs')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  return (
    <div>
      <DashboardHeader title="Clubs" subtitle="Discover and join clubs" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(clubs || []).map((club) => (
          <ClubCard key={club.id} club={club} href={`/dashboard/clubs/${club.id}`} />
        ))}
        {(!clubs || clubs.length === 0) && (
          <EmptyState message="No clubs available yet." />
        )}
      </div>
    </div>
  )
}
