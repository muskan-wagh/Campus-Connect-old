import { createSupabaseServer } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

async function approveClub(clubId) {
  'use server'
  const supabase = await createSupabaseServer()
  await supabase.from('clubs').update({ is_approved: true }).eq('id', clubId)

  const { data: members } = await supabase
    .from('club_members')
    .select('user_id')
    .eq('club_id', clubId)
    .eq('role', 'lead')

  if (members) {
    for (const member of members) {
      await supabase.from('notifications').insert({
        user_id: member.user_id,
        title: 'Club Approved',
        message: 'Your club has been approved and is now visible to everyone.',
        type: 'success',
        link: `/dashboard/clubs/${clubId}`,
        created_at: new Date().toISOString()
      })
    }
  }

  redirect('/dashboard/admin/verify-clubs')
}

async function rejectClub(clubId) {
  'use server'
  const supabase = await createSupabaseServer()
  const { data: members } = await supabase
    .from('club_members')
    .select('user_id')
    .eq('club_id', clubId)

  if (members) {
    for (const member of members) {
      await supabase.from('notifications').insert({
        user_id: member.user_id,
        title: 'Club Rejected',
        message: 'Your club application has been declined.',
        type: 'error',
        created_at: new Date().toISOString()
      })
    }
  }

  await supabase.from('club_members').delete().eq('club_id', clubId)
  await supabase.from('events').delete().eq('club_id', clubId)
  await supabase.from('clubs').delete().eq('id', clubId)
  redirect('/dashboard/admin/verify-clubs')
}

export default async function ClubReviewPage({ params }) {
  const { id } = await params
  const supabase = await createSupabaseServer()

  const { data: club } = await supabase.from('clubs').select('*').eq('id', id).single()
  if (!club) notFound()

  const { data: leads } = await supabase
    .from('club_members')
    .select('profiles(full_name, email)')
    .eq('club_id', id)
    .eq('role', 'lead')

  const { count: membersCount } = await supabase
    .from('club_members')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', id)

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{club.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">Review club details</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-muted border overflow-hidden flex items-center justify-center">
                {club.logo_url ? (
                  <img src={club.logo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-medium text-muted-foreground">{club.name?.[0]}</span>
                )}
              </div>
              <div>
                <h2 className="font-semibold">{club.name}</h2>
                <Badge variant={club.is_approved ? 'success' : 'warning'}>
                  {club.is_approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
            </div>

            {club.description && (
              <p className="text-sm text-muted-foreground">{club.description}</p>
            )}

            <Separator />

            <div className="text-sm">
              <span className="text-muted-foreground">ID: </span>
              <span className="font-mono text-xs">{club.id}</span>
            </div>

            {leads && leads.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Lead(s)</h3>
                {leads.map((lead, i) => (
                  <p key={i} className="text-sm text-muted-foreground">{lead.profiles?.full_name} ({lead.profiles?.email})</p>
                ))}
              </div>
            )}

            <div className="text-sm">
              <span className="text-muted-foreground">Members: </span>
              <span>{membersCount}</span>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Created: </span>
              <span>{new Date(club.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {!club.is_approved && (
          <div className="flex gap-3">
            <form action={approveClub.bind(null, club.id)} className="flex-1">
              <Button type="submit" className="w-full">Approve club</Button>
            </form>
            <form action={rejectClub.bind(null, club.id)} className="flex-1">
              <Button type="submit" variant="destructive" className="w-full">Reject</Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
