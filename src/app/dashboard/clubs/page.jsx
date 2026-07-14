import { createSupabaseServer } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

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
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm truncate">{club.name}</h3>
                      <Badge variant={club.is_approved ? 'success' : 'warning'} className="text-[10px] mt-0.5">
                        {club.is_approved ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  {club.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{club.description}</p>
                  )}
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
                </CardContent>
              </Card>
            </Link>
          )
        })}
        {clubs.length === 0 && (
          <div className="col-span-full text-center py-16 text-sm text-muted-foreground">
            No clubs yet.
          </div>
        )}
      </div>
    </div>
  )
}
