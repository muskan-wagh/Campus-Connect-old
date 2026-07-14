import { createSupabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default async function VerifyClubsPage() {
  const supabase = await createSupabaseServer()
  const { data: clubs } = await supabase
    .from('clubs')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })

  return (
    <div>
      <DashboardHeader title="Verify Clubs" subtitle="Review and approve new clubs" />
      <div className="grid sm:grid-cols-2 gap-4">
        {(clubs || []).map((club) => (
          <Link key={club.id} href={`/dashboard/admin/clubs/${club.id}`}>
            <Card className="hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-sm">{club.name}</h3>
                  <Badge variant="warning">Pending</Badge>
                </div>
                {club.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{club.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{new Date(club.created_at).toLocaleDateString()}</span>
                  <span className="text-xs font-medium text-primary">Review &rarr;</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {(!clubs || clubs.length === 0) && (
          <div className="col-span-full text-center py-16 text-sm text-muted-foreground">
            No clubs pending verification.
          </div>
        )}
      </div>
    </div>
  )
}
