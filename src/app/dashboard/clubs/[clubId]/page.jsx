'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export default function ClubDetailPage() {
  const { clubId } = useParams()
  const [club, setClub] = useState(null)
  const [members, setMembers] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const load = async () => {
      const { data: clubData } = await supabase.from('clubs').select('*').eq('id', clubId).single()
      setClub(clubData)

      const { data: membersData } = await supabase
        .from('club_members')
        .select('*, profiles(full_name, email, avatar_url)')
        .eq('club_id', clubId)
      setMembers(membersData || [])

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .limit(5)
      setEvents(eventsData || [])

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const myMembership = (membersData || []).find((m) => m.user_id === user.id)
        setUserRole(myMembership?.role || null)
      }

      setLoading(false)
    }
    load()
  }, [clubId])

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !club) return

    const ext = file.name.split('.').pop()
    const path = `${clubId}/cover.${ext}`
    const { error } = await supabase.storage.from('clubs').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('clubs').getPublicUrl(path)
      setClub(prev => ({ ...prev, cover_image: publicUrl }))
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !club) return

    const ext = file.name.split('.').pop()
    const path = `${clubId}/logo.${ext}`
    const { error } = await supabase.storage.from('clubs').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('clubs').getPublicUrl(path)
      setClub(prev => ({ ...prev, logo_url: publicUrl }))
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    )
  }

  if (!club) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold mb-2">Club not found</h2>
        <Link href="/dashboard/clubs" className="text-sm text-primary hover:underline">Back to clubs</Link>
      </div>
    )
  }

  const leads = members.filter((m) => m.role === 'lead')
  const regularMembers = members.filter((m) => m.role === 'member')
  const isLead = userRole === 'lead'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative h-48 rounded-xl bg-muted overflow-hidden">
        {club.cover_image ? (
          <img src={club.cover_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10" />
        )}
        {isLead && (
          <label className="absolute bottom-3 right-3 cursor-pointer">
            <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <span className="inline-flex h-8 items-center rounded-lg bg-background/80 backdrop-blur-sm px-3 text-xs font-medium hover:bg-background transition-all">
              Change cover
            </span>
          </label>
        )}
      </div>

      <div className="flex items-start gap-4 -mt-12 relative z-10">
        <div className="relative">
          <div className="h-20 w-20 rounded-xl bg-muted border-4 border-background overflow-hidden flex items-center justify-center">
            {club.logo_url ? (
              <img src={club.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-muted-foreground">{club.name?.[0]}</span>
            )}
          </div>
          {isLead && (
            <label className="absolute -bottom-1 -right-1 cursor-pointer">
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
                </svg>
              </span>
            </label>
          )}
        </div>
        <div className="pt-12">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{club.name}</h1>
            <Badge variant={club.is_approved ? 'success' : 'warning'}>
              {club.is_approved ? 'Verified' : 'Pending'}
            </Badge>
          </div>
          {club.description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{club.description}</p>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight mb-4">Events ({events.length})</h2>
            <div className="space-y-3">
              {events.map((event) => (
                <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                  <Card className="hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={event.status === 'published' ? 'success' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {events.length === 0 && (
                <p className="text-sm text-muted-foreground">No events yet.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight mb-4">Members ({members.length})</h2>
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Avatar src={lead.profiles?.avatar_url} fallback={lead.profiles?.full_name?.[0]} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lead.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{lead.profiles?.email}</p>
                  </div>
                  <Badge variant="secondary">Lead</Badge>
                </div>
              ))}
              {regularMembers.slice(0, 10).map((member) => (
                <div key={member.user_id} className="flex items-center gap-3">
                  <Avatar src={member.profiles?.avatar_url} fallback={member.profiles?.full_name?.[0]} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{member.profiles?.full_name}</p>
                  </div>
                </div>
              ))}
              {regularMembers.length > 10 && (
                <p className="text-xs text-muted-foreground">+{regularMembers.length - 10} more members</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold">{members.length}</div>
                  <div className="text-xs text-muted-foreground">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">{events.length}</div>
                  <div className="text-xs text-muted-foreground">Events</div>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                {isLead && (
                  <>
                    <Link href={`/dashboard/clubs/${clubId}/create-event`}>
                      <Button className="w-full" size="sm">Create event</Button>
                    </Link>
                    <Link href={`/dashboard/clubs/${clubId}/members`}>
                      <Button variant="outline" className="w-full" size="sm">Manage members</Button>
                    </Link>
                  </>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full" size="sm">Back to dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
