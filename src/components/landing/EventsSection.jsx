'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, ArrowRight, MapPin, Clock } from 'lucide-react'

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function EventCard({ event, index }) {
  return (
    <Link href={`/dashboard/events/${event.id}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-border bg-card p-6 hover:shadow-sm hover:border-foreground/20 transition-all duration-300 h-full flex flex-col"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted border overflow-hidden">
            {event.clubs?.logo_url ? (
              <img src={event.clubs.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Calendar className="h-4.5 w-4.5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{event.clubs?.name || 'Club'}</div>
            <div className="text-xs text-muted-foreground">{formatDate(event.created_at)}</div>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-2 group-hover:text-foreground transition-colors line-clamp-2">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
            {event.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <span className="text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
          <span className="text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 transition-all inline-flex items-center gap-1 translate-x-[-4px] group-hover:translate-x-0">
            View event
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </motion.div>
    </Link>
  )
}

export default function EventsSection({ events }) {
  return (
    <section id="events" className="py-24 md:py-32 bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 mb-6 shadow-sm">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Latest events</span>
            </div>
            <h2 className="text-[clamp(1.875rem,4vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.1] mb-3">
              What&apos;s happening on campus
            </h2>
            <p className="text-muted-foreground">Recent happenings across campus</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-medium hover:bg-accent transition-all shrink-0"
          >
            View all events
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {events?.length > 0 ? (
            events.map((event, i) => <EventCard key={event.id} event={event} index={i} />)
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="col-span-full text-center py-20"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-6">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Be the first to create one! Events from clubs across campus will appear here.
              </p>
            </motion.div>
          )}
        </div>

        {events && events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 text-center sm:hidden"
          >
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium hover:bg-accent transition-all"
            >
              View all events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
