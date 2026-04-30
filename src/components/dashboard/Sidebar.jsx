'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'

export default function Sidebar({ user, profile }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createSupabaseClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    const menuItems = {
        student: [
            { name: 'Home', path: '/dashboard/student', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { name: 'Events', path: '/dashboard/student/events', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
            { name: 'Clubs', path: '/dashboard/clubs', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { name: 'Members', path: '/dashboard/members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { name: 'Contact', path: '/dashboard/contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        ],
        club_lead: [
            { name: 'Home', path: '/dashboard/lead', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { name: 'Create', path: '/dashboard/lead/create-club', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
            { name: 'Members', path: '/dashboard/lead/members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { name: 'Live', path: '/dashboard/lead/live-events', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
            { name: 'Contact', path: '/dashboard/contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        ],
        admin: [
            { name: 'Home', path: '/dashboard/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { name: 'Verify', path: '/dashboard/admin/verify-clubs', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { name: 'Events', path: '/dashboard/admin/all-events', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
            { name: 'Members', path: '/dashboard/members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { name: 'Contact', path: '/dashboard/contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        ],
    }

    const currentRole = profile?.role || 'student'
    const items = menuItems[currentRole] || menuItems.student

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-background border-r border-border p-10 z-[100]">
                <div className="mb-12">
                    <Logo showText={true} />
                </div>

                <nav className="flex-grow space-y-2">
                    {items.map((item) => {
                        const isActive = pathname === item.path
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`flex items-center gap-4 px-4 py-3 group transition-all duration-200 ${isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    <svg
                                        className={`w-5 h-5 ${isActive ? 'stroke-[2px]' : 'stroke-[1.5px]'}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                    </svg>
                                </div>
                                <span className={`text-[12px] uppercase tracking-[0.2em] font-semibold ${isActive ? '' : ''}`}>{item.name}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full"></div>}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-auto space-y-8">
                    {/* Minimal User Profile Info */}
                    <Link href="/dashboard/profile" className="flex items-center gap-4 group">
                        <div className="w-10 h-10 bg-muted border border-border flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all rounded-sm">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-serif italic text-muted-foreground">{profile?.full_name?.[0]}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-foreground truncate uppercase tracking-widest">{profile?.full_name || 'User'}</p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">{currentRole.replace('_', ' ')}</p>
                        </div>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 text-muted-foreground hover:text-primary transition-all font-bold text-[10px] uppercase tracking-[0.3em]"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Exit
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navbar - Simplified */}
            <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-card border border-border px-8 py-4 flex justify-between items-center z-[100] shadow-2xl rounded-lg">
                {items.slice(0, 4).map((item) => {
                    const isActive = pathname === item.path
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary scale-110' : 'text-muted-foreground'}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                            </svg>
                        </Link>
                    )
                })}
                <Link href="/dashboard/profile" className={`w-8 h-8 overflow-hidden rounded-full ${pathname === '/dashboard/profile' ? 'border-2 border-primary' : 'border border-border'}`}>
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {profile?.full_name?.[0]}
                        </div>
                    )}
                </Link>
            </nav>
        </>
    )
}
