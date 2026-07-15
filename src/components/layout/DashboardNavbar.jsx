'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Logo } from '@/components/ui/logo'
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
  ChevronDown,
  Bell,
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

export default function DashboardNavbar({ user, profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const currentRole = profile?.role || 'student'
  const items = menuItems[currentRole] || menuItems.student

  const NavLink = ({ item, onClick, mobile }) => {
    const isActive = pathname === item.path
    const Icon = item.icon
    return (
      <Link
        href={item.path}
        onClick={onClick}
        className={cn(
          mobile
            ? 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200'
            : 'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200',
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
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border'
            : 'bg-background'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Logo />

              <nav className="hidden md:flex items-center gap-1 ml-6">
                {items.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-accent transition-colors">
                <Bell className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-accent transition-colors"
                >
                  <Avatar
                    src={profile?.avatar_url}
                    fallback={profile?.full_name?.[0]}
                    size="sm"
                  />
                  <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
                    {profile?.full_name || 'User'}
                  </span>
                  <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-20 w-56 rounded-2xl border border-border bg-card shadow-lg p-2">
                      <div className="px-3 py-2 border-b border-border mb-2">
                        <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate capitalize">{currentRole.replace('_', ' ')}</p>
                      </div>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      >
                        <Users className="h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        onClick={() => { handleLogout(); setProfileOpen(false) }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all w-full mt-1"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl hover:bg-accent transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border shadow-xl">
            <div className="flex items-center justify-between px-4 h-16 border-b border-border">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-accent transition-colors" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="p-3 space-y-1">
              {items.map((item) => (
                <NavLink key={item.name} item={item} onClick={() => setMobileOpen(false)} mobile />
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <Avatar
                  src={profile?.avatar_url}
                  fallback={profile?.full_name?.[0]}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate capitalize">{currentRole.replace('_', ' ')}</p>
                </div>
              </div>
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
    </>
  )
}
