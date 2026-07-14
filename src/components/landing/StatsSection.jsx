'use client'

import { motion } from 'framer-motion'
import { Users, Calendar, Building2, TrendingUp } from 'lucide-react'

const stats = [
  {
    icon: Building2,
    label: 'Active Clubs',
    value: '42',
    growth: '+18% this semester',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Calendar,
    label: 'Events Hosted',
    value: '1.8k+',
    growth: '+12% this month',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Users,
    label: 'Students Connected',
    value: '99%',
    growth: 'Campus-wide adoption',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: TrendingUp,
    label: 'Engagement Rate',
    value: '94%',
    growth: '+8% vs last year',
    color: 'bg-violet-50 text-violet-600',
  },
]

export default function StatsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group rounded-2xl border border-border bg-card p-6 hover:shadow-sm hover:border-foreground/20 transition-all duration-300"
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-[-0.03em] leading-none mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-foreground mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.growth}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
