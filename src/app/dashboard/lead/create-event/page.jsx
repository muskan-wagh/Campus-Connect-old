'use client'

import { useState, useEffect, Suspense } from 'react'
import { useFormState } from '@/hooks/use-form-state'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'

function CreateEventForm() {
  const [clubs, setClubs] = useState([])
  const [clubId, setClubId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')
  const { loading, error, success, handleSubmit } = useFormState()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClub = searchParams.get('clubId')
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchClubs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('club_members')
        .select('clubs(id, name)')
        .eq('user_id', user.id)
        .eq('role', 'lead')

      const clubList = (data || []).map((m) => m.clubs).filter(Boolean)
      setClubs(clubList)

      if (preselectedClub && clubList.some((c) => c.id === preselectedClub)) {
        setClubId(preselectedClub)
      } else if (clubList.length > 0) {
        setClubId(clubList[0].id)
      }
    }
    fetchClubs()
  }, [preselectedClub])

  const onSubmit = async (e) => {
    e.preventDefault()
    await handleSubmit(async () => {
      const { error: eventErr } = await supabase
        .from('events')
        .insert({
          club_id: clubId,
          title,
          description,
          event_date: eventDate,
          location,
          status: 'published',
          is_admin_approved: false,
          created_at: new Date().toISOString()
        })

      if (eventErr) throw eventErr

      setTimeout(() => router.push('/dashboard/lead/live-events'), 2000)
    })
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2">Event created!</h2>
        <p className="text-sm text-muted-foreground">Redirecting to events...</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create Event</h1>
        <p className="text-sm text-muted-foreground mt-1">Publish a new event for your club.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="club">Club</Label>
              <Select id="club" value={clubId} onChange={(e) => setClubId(e.target.value)} required>
                <option value="" disabled>Select a club</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your event" rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input id="date" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Event location" />
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Publishing...' : 'Publish event'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary mx-auto mt-20" />}>
      <CreateEventForm />
    </Suspense>
  )
}
