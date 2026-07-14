import { createSupabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

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
          <Link key={club.id} href={`/dashboard/admin/clubs/${club.id}`}>
            <Card className="hover:shadow-md transition-all cursor-pointer h-full">
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
                    <Badge variant="success" className="text-[10px] mt-0.5">Verified</Badge>
                  </div>
                </div>
                {club.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{club.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{new Date(club.created_at).toLocaleDateString()}</span>
                  <span className="text-xs font-medium text-primary">Manage &rarr;</span>
                </div>
              </CardContent>
            </Card>
          </Link>
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
