import { createSupabaseServer, createSupabaseAnon } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'

const getGlobalStudentStats = unstable_cache(
    async () => {
        const supabase = createSupabaseAnon()
        if (!supabase) return { eventsCount: 0, clubsCount: 0 }

        const [
            { count: eventsCount },
            { count: clubsCount }
        ] = await Promise.all([
            supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
            supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('is_approved', true)
        ])
        return { eventsCount, clubsCount }
    },
    ['global-student-stats'],
    { revalidate: 60, tags: ['events', 'clubs'] }
)

const getUserMemberships = unstable_cache(
    async (userId) => {
        const supabase = createSupabaseAnon()
        if (!supabase) return { myMemberships: [], myCommunitiesCount: 0 }

        const { data: myMemberships, count: myCommunitiesCount } = await supabase
            .from('club_members')
            .select('*, clubs(*)', { count: 'exact' })
            .eq('user_id', userId)
        return { myMemberships, myCommunitiesCount }
    },
    ['user-memberships'],
    { revalidate: 60, tags: ['memberships'] }
)

const getUpcomingEvents = unstable_cache(
    async () => {
        const supabase = createSupabaseAnon()
        if (!supabase) return []

        const { data: upcomingEvents } = await supabase
            .from('events')
            .select('*, clubs(name, logo_url)')
            .eq('status', 'published')
            .order('event_date', { ascending: true })
            .limit(5)
        return upcomingEvents
    },
    ['upcoming-events'],
    { revalidate: 60, tags: ['events'] }
)

export default async function StudentDashboard() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch stats and data with cache
    const [
        { eventsCount, clubsCount },
        { myMemberships, myCommunitiesCount },
        upcomingEvents
    ] = await Promise.all([
        getGlobalStudentStats(),
        getUserMemberships(user.id),
        getUpcomingEvents()
    ])

    const myClubs = myMemberships?.map(m => m.clubs) || []

    const stats = [
        { name: 'Live Comms', value: eventsCount || 0, color: 'text-purple-500', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z' },
        { name: 'Active Nodes', value: clubsCount || 0, color: 'text-blue-500', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'My Frequencies', value: myCommunitiesCount || 0, color: 'text-pink-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    ]

    return (
        <div className="pb-12 text-slate-900">
            <Header
                title="Student Hub"
                subtitle="MONITORING CAMPUS SYNC"
                user={user}
            />

            <div className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-xl shadow-slate-200/50 hover:shadow-orange-500/10 transition-all duration-500">
                            <div className="relative z-10">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">{stat.name}</p>
                                <div className="flex items-baseline gap-3">
                                    <h2 className="text-5xl font-black tracking-tighter text-slate-900 group-hover:text-orange-600 transition-colors">{stat.value}</h2>
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-orange-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700 flex items-center justify-center p-6">
                                <svg className="w-full h-full text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={stat.icon} />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Events Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Live Feed</h2>
                            <Link href="/dashboard/student/events" className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all">Full Broadcast &rarr;</Link>
                        </div>

                        <div className="space-y-8">
                            {upcomingEvents?.length > 0 ? upcomingEvents.map((event) => (
                                <div key={event.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] group hover:border-orange-200 transition-all duration-500 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.02] rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/[0.05] transition-all duration-700"></div>

                                    <div className="flex items-center gap-5 mb-8 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-orange-200 transition-colors">
                                            {event.clubs?.logo_url ? (
                                                <img src={event.clubs.logo_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-black text-slate-400 group-hover:text-orange-500 transition-colors">{event.clubs?.name?.[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-base tracking-tight">{event.clubs?.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(event.event_date).toLocaleDateString()} &bull; Verified
                                            </p>
                                        </div>
                                        <div className="ml-auto px-4 py-1.5 bg-orange-50 border border-orange-100 rounded-full text-[9px] font-black text-orange-600 uppercase tracking-widest shadow-sm">
                                            Live
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-black text-slate-900 mb-5 tracking-tighter group-hover:text-orange-600 transition-colors leading-[1.1] relative z-10">{event.title}</h3>
                                    <p className="text-slate-500 text-base font-medium leading-relaxed line-clamp-2 mb-8 relative z-10">{event.description}</p>

                                    <div className="flex items-center justify-between pt-8 border-t border-slate-50 relative z-10">
                                        <div className="flex items-center gap-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-2 text-orange-500 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                {event.location}
                                            </span>
                                        </div>
                                        <Link href={`/dashboard/events/${event.id}`} className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white hover:bg-orange-600 shadow-lg shadow-slate-200 hover:shadow-orange-500/30 transition-all group/link">
                                            <svg className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 border-2 border-dashed border-slate-100 rounded-[3rem] text-center bg-white/50">
                                    <p className="text-slate-300 font-black text-[11px] uppercase tracking-[0.4em]">Subspace Silence Detected</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Communities Sidebar */}
                    <div className="space-y-10">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Favorite Nodes</h2>
                        </div>

                        <div className="bg-white border border-slate-50 p-10 rounded-[3rem] shadow-xl shadow-slate-100 relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl"></div>

                            <div className="space-y-8 relative z-10">
                                {myClubs.length > 0 ? myClubs.map((club) => (
                                    <Link key={club.id} href={`/dashboard/clubs/${club.id}`} className="flex items-center gap-5 group">
                                        <div className="w-14 h-14 rounded-[1.25rem] bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center group-hover:border-orange-200 group-hover:shadow-lg transition-all duration-300 shadow-inner">
                                            {club.logo_url ? (
                                                <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-black text-slate-300 text-xl group-hover:text-orange-500 transition-colors">{club.name[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-black text-slate-900 text-base group-hover:text-orange-600 transition-colors tracking-tight">{club.name}</h4>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Node Verified
                                            </p>
                                        </div>
                                    </Link>
                                )) : (
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center py-6">0 Clusters Connected</p>
                                )}
                            </div>

                            <Link href="/dashboard/clubs" className="block w-full text-center mt-12 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-500/20 transition-all active:scale-[0.98]">
                                EXPLORE ALL NODES
                            </Link>
                        </div>

                        {/* Special Actions */}
                        <div className="bg-gradient-to-br from-orange-600 to-orange-400 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl shadow-orange-500/20">
                            <div className="relative z-10 text-white">
                                <h4 className="text-2xl font-black mb-3 tracking-tighter">Elevate Rights</h4>
                                <p className="text-orange-50/80 text-xs font-bold leading-relaxed mb-8 opacity-90">Apply for Club Lead status to initiate your own transmissions and manage campus clusters.</p>
                                <Link href="/dashboard/about" className="inline-block px-10 py-4 bg-white text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-orange-900/10">
                                    Initiate Sync
                                </Link>
                            </div>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24 group-hover:bg-white/20 transition-all duration-700"></div>
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

