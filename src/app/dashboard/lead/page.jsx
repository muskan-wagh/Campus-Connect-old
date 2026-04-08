import { createSupabaseServer, createSupabaseAnon } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'

const getLeadClubs = unstable_cache(
    async (userId) => {
        const supabase = createSupabaseAnon()
        if (!supabase) return []

        const { data: myClubs } = await supabase
            .from('club_members')
            .select(`
                club_id,
                clubs (
                    id,
                    name,
                    description,
                    is_approved
                )
            `)
            .eq('user_id', userId)
            .eq('role', 'lead')

        return myClubs?.map(mc => mc.clubs).filter(Boolean) || []
    },
    ['lead-clubs'],
    { revalidate: 60, tags: ['clubs'] }
)

const getLeadStats = unstable_cache(
    async (clubIds) => {
        const supabase = createSupabaseAnon()
        if (!supabase || !clubIds || clubIds.length === 0) return { totalMembers: 0, totalEvents: 0 }

        const [
            { count: membersCount },
            { count: eventsCount }
        ] = await Promise.all([
            supabase
                .from('club_members')
                .select('*', { count: 'exact', head: true })
                .in('club_id', clubIds),
            supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .in('club_id', clubIds)
        ])

        return { totalMembers: membersCount || 0, totalEvents: eventsCount || 0 }
    },
    ['lead-stats'],
    { revalidate: 60, tags: ['lead-stats'] }
)

export default async function LeadDashboard() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch My Clubs with cache - using key inclusive of userId
    const clubs = await getLeadClubs(user.id)

    // Total stats across all my clubs with cache
    const { totalMembers, totalEvents } = await getLeadStats(clubs.map(c => c.id))

    const stats = [
        { name: 'Club Members', value: totalMembers || 0, change: 'total', color: 'from-[#3B82F6] to-[#2563EB]', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'My Events', value: totalEvents || 0, change: 'across clubs', color: 'from-[#EC4899] to-[#DB2777]', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Managed Clubs', value: clubs.length, change: 'verified', color: 'from-[#0b87bd] to-[#096a96]', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    ]

    return (
        <div className="pb-12 text-slate-900">
            <Header
                title="Lead Command"
                subtitle="ORCHESTRATING CAMPUS CLUSTERS"
                user={user}
            />

            <div className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

                {/* Management Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Managed Nodes</h2>
                            <Link href="/dashboard/lead/create-club" className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-slate-200">INITIALIZE NEW NODE</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {clubs.length > 0 ? clubs.map(club => (
                                <div key={club.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] group hover:border-orange-200 transition-all duration-500 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.02] rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/[0.05] transition-all duration-700"></div>

                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${club.is_approved ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                            {club.is_approved ? 'Active Sync' : 'Awaiting Link'}
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 group-hover:text-orange-600 transition-colors mb-4 tracking-tighter leading-[1.1] relative z-10">{club.name}</h3>
                                    <p className="text-slate-500 text-base font-medium line-clamp-2 mb-8 relative z-10">"{club.description}"</p>
                                    <div className="flex items-center gap-4 pt-8 border-t border-slate-50 relative z-10">
                                        <Link href={`/dashboard/lead/members?club=${club.id}`} className="flex-1 text-center py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-white transition-all border border-slate-100">Members</Link>
                                        <Link href={`/dashboard/lead/create-event?club=${club.id}`} className="flex-1 text-center py-4 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/20">Broadcast</Link>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 p-20 border-2 border-dashed border-slate-100 rounded-[3rem] text-center bg-white/50">
                                    <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-[11px] mb-4">No active nodes under your auth code</p>
                                    <Link href="/dashboard/lead/create-club" className="text-orange-500 font-black uppercase tracking-widest text-[10px] hover:underline decoration-2 underline-offset-4">Deploy initial node &rarr;</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-10">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Fast Protocols</h2>
                        </div>
                        <div className="bg-white border border-slate-50 p-6 rounded-[2.5rem] shadow-xl shadow-slate-100">
                            <div className="space-y-3">
                                {[
                                    { name: 'Inject New Member', path: '/dashboard/lead/add-member', icon: 'M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0' },
                                    { name: 'Monitor Live Feed', path: '/dashboard/lead/live-events', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                                    { name: 'Global Node Directory', path: '/dashboard/lead/all-clubs', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                                ].map(action => (
                                    <Link key={action.name} href={action.path} className="flex items-center gap-4 p-5 hover:bg-orange-50 rounded-2xl transition-all group border border-transparent hover:border-orange-100">
                                        <div className="w-11 h-11 bg-slate-50 group-hover:bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-all border border-slate-100 group-hover:shadow-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={action.icon} />
                                            </svg>
                                        </div>
                                        <span className="text-[11px] font-black text-slate-500 group-hover:text-slate-900 uppercase tracking-widest">{action.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl shadow-slate-400/20">
                            <div className="relative z-10 text-white">
                                <h4 className="text-2xl font-black mb-3 tracking-tighter">Sync Shield</h4>
                                <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8 opacity-90">Your lead status is verified. Maintain your transmission uptime to retain protocol priority.</p>
                                <Link href="/dashboard/lead/all-clubs" className="inline-block px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Status Report
                                </Link>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/20 transition-all duration-700"></div>
                            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
