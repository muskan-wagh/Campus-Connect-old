'use client'

import Link from 'next/link'
import { Building2, Github, Twitter } from 'lucide-react'

const footerLinks = [
  {
    title: 'Platform',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Events', href: '#events' },
      { label: 'Network', href: '#network' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/dashboard/about' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '/dashboard/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 py-12 md:py-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background text-sm font-bold">CC</span>
              </div>
              <span className="text-base font-semibold tracking-tight">
                Campus<span className="text-muted-foreground">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              The unified platform for campus club and event management.
            </p>
            <div className="flex items-center gap-3">
              <Link href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors">
                <Twitter className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors">
                <Github className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link href="/dashboard/contact" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold mb-4">{group.title}</h4>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Campus Connect. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <span className="text-muted-foreground">&middot;</span>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
