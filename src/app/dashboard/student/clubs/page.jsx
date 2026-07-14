import { createSupabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

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
          <Link key={club.id} href={`/dashboard/clubs/${club.id}`}>
            <Card className="h-full hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-muted border overflow-hidden flex items-center justify-center shrink-0">
                    {club.logo_url ? (
                      <img src={club.logo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">{club.name?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{club.name}</h3>
                    {club.is_approved && (
                      <Badge variant="success" className="text-[10px] mt-0.5">Verified</Badge>
                    )}
                  </div>
                </div>
                {club.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{club.description}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
        {(!clubs || clubs.length === 0) && (
          <div className="col-span-full text-center py-16 text-sm text-muted-foreground">
            No clubs available yet.
          </div>
        )}
      </div>
    </div>
  )
}
