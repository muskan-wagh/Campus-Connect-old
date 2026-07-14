'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar, Users, Bell, Activity } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: 0.4 + i * 0.15,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

function FloatingCard({ icon: Icon, label, value, color, index, badge }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{label}</span>
          {badge && (
            <span className="inline-flex items-center rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary">
              {badge}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{value}</span>
      </div>
    </motion.div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.015] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-primary/[0.01] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs text-muted-foreground font-medium">All systems operational</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-[-0.04em] leading-[0.95] mb-6"
            >
              Empowering Your{' '}
              <span className="text-muted-foreground">Campus Journey</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg"
            >
              The unified platform for university organizations to manage clubs, broadcast events, and stay connected with the campus community.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/auth/register"
                className="group inline-flex h-12 items-center justify-center rounded-xl bg-foreground text-background px-8 text-sm font-medium hover:opacity-90 transition-all active:scale-[0.97] shadow-sm"
              >
                Get started free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-8 text-sm font-medium hover:bg-accent transition-all active:scale-[0.97]"
              >
                Learn more
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12 flex items-center gap-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-muted-foreground to-muted"
                  />
                ))}
              </div>
              <div>
                <div className="text-sm font-medium">Trusted by students</div>
                <div className="text-xs text-muted-foreground">Across university campuses</div>
              </div>
            </motion.div>
          </motion.div>

          <div className="relative lg:mt-0 mt-12">
            <div className="relative mx-auto max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
              >
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium ml-2">Dashboard</span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Upcoming Events</div>
                      <div className="text-2xl font-bold tracking-tight">8 events</div>
                    </div>
                    <div className="flex -space-x-1.5">
                      <div className="h-7 w-7 rounded-full border-2 border-card bg-indigo-100 flex items-center justify-center">
                        <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                      </div>
                      <div className="h-7 w-7 rounded-full border-2 border-card bg-emerald-100 flex items-center justify-center">
                        <Activity className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="space-y-3">
                    {[
                      { title: 'Tech Fest 2026', club: 'CS Club', time: 'Today, 4:00 PM', color: 'bg-indigo-500' },
                      { title: 'Weekly Jam Session', club: 'Music Club', time: 'Tomorrow, 6:00 PM', color: 'bg-emerald-500' },
                      { title: 'Debate Tournament', club: 'Debate Society', time: 'Fri, 2:00 PM', color: 'bg-amber-500' },
                    ].map((event, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 hover:bg-accent transition-colors cursor-pointer">
                        <div className={`h-2 w-2 rounded-full ${event.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{event.title}</div>
                          <div className="text-xs text-muted-foreground">{event.club} &middot; {event.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-border" />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border p-3 text-center">
                      <div className="text-lg font-bold tracking-tight">42</div>
                      <div className="text-[11px] text-muted-foreground">Active Clubs</div>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-center">
                      <div className="text-lg font-bold tracking-tight">1.8k</div>
                      <div className="text-[11px] text-muted-foreground">Events</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="absolute -top-3 -right-3 hidden sm:block">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-xl border border-border bg-card p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">3 new notifications</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
