import { createSupabaseServer } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { ClubCard } from '@/components/ui/club-card'

export default async function VerifiedClubsPage() {
  const supabase = await createSupabaseServer()
  const { data: clubs } = await supabase
    .from('clubs')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  return (
    <div>
      <DashboardHeader title="Verified Clubs" subtitle="All approved clubs on the platform" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(clubs || []).map((club) => (
          <ClubCard key={club.id} club={club} href={`/dashboard/admin/clubs/${club.id}`}>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">{new Date(club.created_at).toLocaleDateString()}</span>
              <span className="text-xs font-medium text-primary">Manage &rarr;</span>
            </div>
          </ClubCard>
        ))}
        {(!clubs || clubs.length === 0) && (
          <div className="col-span-full text-center py-16 text-sm text-muted-foreground">
            No verified clubs yet.
          </div>
        )}
      </div>
    </div>
  )
}
