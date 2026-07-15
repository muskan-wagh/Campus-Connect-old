'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import { EventCard } from '@/components/ui/event-card'

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
            events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <EventCard event={event} href={`/dashboard/events/${event.id}`} />
              </motion.div>
            ))
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
