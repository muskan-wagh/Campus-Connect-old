'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default function ClubCreateEventPage() {
  const { clubId } = useParams()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('draft')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [clubName, setClubName] = useState('')
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchClub = async () => {
      const { data } = await supabase.from('clubs').select('name, is_approved').eq('id', clubId).single()
      if (data) {
        setClubName(data.name)
        if (!data.is_approved) {
          setError('This club is not yet approved. Events can only be created for approved clubs.')
        }
      }
    }
    fetchClub()
  }, [clubId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: eventErr } = await supabase
        .from('events')
        .insert({
          club_id: clubId,
          title,
          description,
          event_date: eventDate,
          location,
          status,
          is_admin_approved: false,
          created_at: new Date().toISOString()
        })

      if (eventErr) throw eventErr
      router.push(`/dashboard/clubs/${clubId}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <DashboardHeader title="Create Event" subtitle={clubName ? `New event for ${clubName}` : ''} />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Creating...' : 'Create event'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
