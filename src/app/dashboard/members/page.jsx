import { createSupabaseServer } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

const getMembers = unstable_cache(
  async () => {
    const supabase = await createSupabaseServer()
    if (!supabase) return []

    const { data } = await supabase
      .from('profiles')
      .select('*, club_members(clubs(name))')
      .order('created_at', { ascending: false })

    return data || []
  },
  ['members-list'],
  { revalidate: 30 }
)

export default async function MembersPage() {
  const members = await getMembers()

  return (
    <div>
      <DashboardHeader title="Members" subtitle="All campus network members" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar
                  src={member.avatar_url}
                  fallback={member.full_name?.[0]}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{member.full_name}</p>
                  <Badge variant="secondary" className="capitalize text-[10px]">{member.role}</Badge>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {member.institute_name && <p>{member.institute_name}</p>}
                {member.education_level && member.degree && (
                  <p>{member.education_level} in {member.degree}</p>
                )}
                {member.academic_year && <p>Year: {member.academic_year}</p>}
                {member.club_members?.length > 0 && (
                  <p className="pt-1">Clubs: {member.club_members.map((m) => m.clubs?.name).filter(Boolean).join(', ')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {members.length === 0 && (
          <div className="col-span-full text-center py-16 text-sm text-muted-foreground">
            No members found.
          </div>
        )}
      </div>
    </div>
  )
}
