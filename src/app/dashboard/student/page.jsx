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
        { name: 'Live Comms', value: eventsCount || 0, icon: '01' },
        { name: 'Active Nodes', value: clubsCount || 0, icon: '02' },
        { name: 'My Frequency', value: myCommunitiesCount || 0, icon: '03' },
    ]

    return (
        <div className="pb-24">
            <Header
                title="Student Hub"
                subtitle="MONITORING CAMPUS SYNC"
                user={user}
            />

            <div className="space-y-20 md:space-y-32">
                {/* Minimal Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 border-b border-slate-50 pb-10 md:pb-16">
                    {stats.map((stat) => (
                        <div key={stat.name} className="group">
                            <div className="flex items-center gap-3 mb-2 md:mb-4">
                                <span className="font-serif italic text-lg opacity-30 tracking-tight">{stat.icon}</span>
                                <span className="journal-label mb-0">{stat.name}</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-5xl md:text-7xl font-serif text-slate-900 leading-none">{stat.value}</h2>
                                <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">In-Matrix</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                    {/* Left Column: Events Feed */}
                    <div className="lg:col-span-8 space-y-16">
                        <div className="flex items-center gap-3 mb-12">
                            <span className="font-serif italic text-2xl">A.</span>
                            <h2 className="text-xl font-serif">Current Transmissions</h2>
                        </div>

                        <div className="space-y-16">
                            {upcomingEvents?.length > 0 ? upcomingEvents.map((event) => (
                                <article key={event.id} className="group border-b border-slate-50 pb-12 last:border-0">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="journal-label mb-0 text-slate-900">{event.clubs?.name}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                <span className="journal-label mb-0">{new Date(event.event_date).toLocaleDateString()}</span>
                                            </div>

                                            <h3 className="text-2xl md:text-4xl font-serif mb-4 md:mb-6 group-hover:text-slate-600 transition-colors leading-tight">{event.title}</h3>
                                            <p className="text-sm text-slate-500 font-light leading-relaxed mb-6 md:mb-8 max-w-xl">{event.description}</p>

                                            <div className="flex items-center gap-6">
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">@{event.location}</span>
                                                <Link href={`/dashboard/events/${event.id}`} className="text-[10px] uppercase tracking-widest font-bold border-b border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-500 transition-all">
                                                    Full Briefing &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            )) : (
                                <div className="p-20 border border-slate-100 bg-slate-50/30 text-center">
                                    <p className="journal-label opacity-40">Zero active transmissions detected in this cycle.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sidebar info */}
                    <div className="lg:col-span-4 space-y-16">
                        {/* Connected Nodes */}
                        <section>
                            <div className="flex items-center gap-3 mb-12">
                                <span className="font-serif italic text-2xl">B.</span>
                                <h2 className="text-xl font-serif">Verified Nodes</h2>
                            </div>

                            <div className="space-y-8">
                                {myClubs.length > 0 ? myClubs.map((club) => (
                                    <Link key={club.id} href={`/dashboard/clubs/${club.id}`} className="flex items-center gap-5 group border-b border-slate-50 pb-4 last:border-0 hover:border-slate-300 transition-colors">
                                        <div className="w-12 h-12 bg-slate-50 grayscale border border-slate-100 flex items-center justify-center overflow-hidden transition-all group-hover:grayscale-0">
                                            {club.logo_url ? (
                                                <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-serif italic text-slate-400">{club.name[0]}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-[12px] font-bold uppercase tracking-widest text-slate-900 truncate group-hover:text-slate-600 transition-colors">{club.name}</h4>
                                            <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">NODE VERIFIED</p>
                                        </div>
                                    </Link>
                                )) : (
                                    <p className="journal-label opacity-30 text-center py-10">0 Active Clusters</p>
                                )}
                            </div>

                            <Link href="/dashboard/clubs" className="btn-secondary w-full text-center mt-12 block py-4 text-[10px]">
                                Browse All Clusters
                            </Link>
                        </section>

                        {/* CTA Section - Minimal */}
                        <section className="bg-slate-900 p-10 text-white cursor-pointer select-none">
                            <div className="journal-label text-slate-400 mb-4 tracking-[0.4em]">Promotion Request</div>
                            <h4 className="text-2xl font-serif mb-6 leading-snug">Become a Lead Communicator</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-light mb-8 italic">Apply to bridge directly with the campus mainframe and manage your own transmissions.</p>
                            <Link href="/dashboard/about" className="text-[10px] font-bold uppercase tracking-widest border-b border-white pb-1 group hover:text-slate-300 hover:border-slate-300 transition-all">
                                View Requirements &rarr;
                            </Link>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
