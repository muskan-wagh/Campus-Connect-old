'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default function LiveEventsPage() {
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('all')
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: clubs } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', user.id)
        .eq('role', 'lead')

      const clubIds = (clubs || []).map((c) => c.club_id)
      if (clubIds.length === 0) return

      let query = supabase
        .from('events')
        .select('*, clubs(name)')
        .in('club_id', clubIds)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data } = await query
      setEvents(data || [])
    }
    fetchEvents()
  }, [filter])

  const toggleStatus = async (eventId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    await supabase.from('events').update({ status: newStatus }).eq('id', eventId)
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e))
  }

  const deleteEvent = async (eventId) => {
    await supabase.from('events').delete().eq('id', eventId)
    setEvents(prev => prev.filter(e => e.id !== eventId))
  }

  return (
    <div>
      <DashboardHeader title="Live Events" subtitle="Manage your club events" />

      <div className="flex items-center gap-2 mb-6">
        {['all', 'published', 'draft', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="ml-auto">
          <Link href="/dashboard/lead/create-event">
            <Button size="sm">New event</Button>
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-sm">{event.title}</h3>
                  <p className="text-xs text-muted-foreground">{event.clubs?.name}</p>
                </div>
                <Badge variant={
                  event.status === 'published' ? 'success' :
                  event.status === 'draft' ? 'warning' : 'destructive'
                }>
                  {event.status}
                </Badge>
              </div>
              {event.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => toggleStatus(event.id, event.status)}>
                    {event.status === 'published' ? 'Draft' : 'Publish'}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteEvent(event.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && (
          <div className="col-span-full text-center py-16 text-sm text-muted-foreground">
            No events found.
          </div>
        )}
      </div>
    </div>
  )
}
