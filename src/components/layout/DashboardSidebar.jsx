'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  PlusCircle,
  Video,
  ShieldCheck,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const menuItems = {
  student: [
    { name: 'Home', path: '/dashboard/student', icon: LayoutDashboard },
    { name: 'Events', path: '/dashboard/student/events', icon: Calendar },
    { name: 'Clubs', path: '/dashboard/clubs', icon: Building2 },
    { name: 'Members', path: '/dashboard/members', icon: Users },
  ],
  club_lead: [
    { name: 'Home', path: '/dashboard/lead', icon: LayoutDashboard },
    { name: 'Create Club', path: '/dashboard/lead/create-club', icon: PlusCircle },
    { name: 'Members', path: '/dashboard/lead/members', icon: Users },
    { name: 'Events', path: '/dashboard/lead/live-events', icon: Video },
  ],
  admin: [
    { name: 'Home', path: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Verify Clubs', path: '/dashboard/admin/verify-clubs', icon: ShieldCheck },
    { name: 'All Events', path: '/dashboard/admin/all-events', icon: FileText },
    { name: 'Members', path: '/dashboard/members', icon: Users },
  ],
}

export default function DashboardSidebar({ user, profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const currentRole = profile?.role || 'student'
  const items = menuItems[currentRole] || menuItems.student

  const NavLink = ({ item, onClick }) => {
    const isActive = pathname === item.path
    const Icon = item.icon
    return (
      <Link
        href={item.path}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
          isActive
            ? 'bg-foreground/5 text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
        <span>{item.name}</span>
      </Link>
    )
  }

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-sidebar border-r border-border py-6 z-40">
        <div className="px-6 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background text-sm font-bold">CC</span>
            </div>
            <span className="text-base font-semibold tracking-tight">
              Campus<span className="text-muted-foreground">Connect</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>

        <div className="px-3 mt-auto">
          <div className="border-t border-border pt-4 space-y-3">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent transition-all group"
            >
              <Avatar
                src={profile?.avatar_url}
                fallback={profile?.full_name?.[0]}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{currentRole.replace('_', ' ')}</p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all w-full text-sm"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border z-50 px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-accent transition-all"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background text-xs font-bold">CC</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Campus<span className="text-muted-foreground">Connect</span>
          </span>
        </Link>
        <Avatar
          src={profile?.avatar_url}
          fallback={profile?.full_name?.[0]}
          size="sm"
        />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border shadow-xl">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
                  <span className="text-background text-xs font-bold">CC</span>
                </div>
                <span className="text-sm font-semibold tracking-tight">
                  Campus<span className="text-muted-foreground">Connect</span>
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-accent transition-all" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="p-3 space-y-1 overflow-y-auto" style={{ height: 'calc(100% - 3.5rem - 4rem)' }}>
              {items.map((item) => (
                <NavLink key={item.name} item={item} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
              <button
                onClick={() => { handleLogout(); setMobileOpen(false) }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all w-full text-sm"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:hidden h-14" />
    </>
  )
}
