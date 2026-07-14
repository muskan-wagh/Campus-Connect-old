'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.015] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 mb-8 shadow-sm">
            <Sparkles className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Get started today</span>
          </div>

          <h2 className="text-[clamp(1.875rem,4vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.1] mb-4">
            Ready to transform your campus experience?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg mx-auto">
            Join your campus community today. Create an account and start exploring clubs, events, and more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="group inline-flex h-12 items-center justify-center rounded-xl bg-foreground text-background px-8 text-sm font-medium hover:opacity-90 transition-all active:scale-[0.97] shadow-sm"
            >
              Create your account
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-8 text-sm font-medium hover:bg-accent transition-all active:scale-[0.97]"
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
