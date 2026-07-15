'use client'

import { motion } from 'framer-motion'
import {
  Building2,
  Calendar,
  LayoutDashboard,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Users,
} from 'lucide-react'

const features = [
  {
    icon: Building2,
    title: 'Club Management',
    description: 'Create and manage clubs with member roles, permissions, and communication tools.',
    illustration: 'M12 21v-6m0 0l-2-2m2 2l2-2m-6 4h12M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z',
    color: 'from-indigo-500/10 to-indigo-500/5',
    iconColor: 'text-indigo-600 bg-indigo-50',
  },
  {
    icon: Calendar,
    title: 'Event Broadcasting',
    description: 'Publish and promote events across the campus network with real-time updates.',
    illustration: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    color: 'from-emerald-500/10 to-emerald-500/5',
    iconColor: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: LayoutDashboard,
    title: 'Smart Dashboard',
    description: 'Get a personalized dashboard showing relevant events, clubs, and activities.',
    illustration: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    color: 'from-violet-500/10 to-violet-500/5',
    iconColor: 'text-violet-600 bg-violet-50',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based Access',
    description: 'Different views for students, club leads, and administrators with appropriate controls.',
    illustration: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    color: 'from-amber-500/10 to-amber-500/5',
    iconColor: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description: 'Stay updated with instant notifications about club activities and event changes.',
    illustration: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    color: 'from-blue-500/10 to-blue-500/5',
    iconColor: 'text-blue-600 bg-blue-50',
  },
  {
    icon: CheckCircle2,
    title: 'Verification System',
    description: 'Admin approval workflow ensures all content is appropriate and authentic.',
    illustration: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'from-rose-500/10 to-rose-500/5',
    iconColor: 'text-rose-600 bg-rose-50',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 mb-6 shadow-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Platform features</span>
          </div>
          <h2 className="text-[clamp(1.875rem,4vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.1] mb-4">
            Everything you need to manage campus life
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
            From club management to event broadcasting, Campus Connect provides the infrastructure for your campus community.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-2xl border border-border bg-card p-6 hover:shadow-sm hover:border-foreground/20 transition-all duration-300 flex flex-col"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feature.iconColor}`}>
                  <feature.icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feature.description}</p>

                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                    Learn more
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
