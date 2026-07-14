import { createSupabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default async function EventDetailPage({ params }) {
  const { eventId } = await params
  const supabase = await createSupabaseServer()

  const { data: event } = await supabase
    .from('events')
    .select('*, clubs(name, logo_url, id)')
    .eq('id', eventId)
    .single()

  if (!event) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block">
          &larr; Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Link href={`/dashboard/clubs/${event.clubs?.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="h-10 w-10 rounded-lg bg-muted border overflow-hidden flex items-center justify-center">
                  {event.clubs?.logo_url ? (
                    <img src={event.clubs.logo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">{event.clubs?.name?.[0]}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{event.clubs?.name}</p>
                  <p className="text-xs text-muted-foreground">View club &rarr;</p>
                </div>
              </Link>
              <Badge variant={event.status === 'published' ? 'success' : 'secondary'} className="ml-auto">
                {event.status}
              </Badge>
            </div>

            <Separator className="my-4" />

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {event.description || 'No description provided.'}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {event.event_date && (
                <div>
                  <span className="text-muted-foreground">Date</span>
                  <p className="font-medium">{new Date(event.event_date).toLocaleString()}</p>
                </div>
              )}
              {event.location && (
                <div>
                  <span className="text-muted-foreground">Location</span>
                  <p className="font-medium">{event.location}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium">{new Date(event.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save
          </Button>
          <Button variant="ghost">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}
