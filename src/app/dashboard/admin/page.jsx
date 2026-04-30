import { createSupabaseServer, createSupabaseAnon } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'

const getAdminStats = unstable_cache(
    async () => {
        const supabase = createSupabaseAnon()
        if (!supabase) return { totalClubs: 0, pendingClubsCount: 0, totalUsers: 0 }

        const [
            { count: totalClubs },
            { count: pendingClubsCount },
            { count: totalUsers }
        ] = await Promise.all([
            supabase.from('clubs').select('*', { count: 'exact', head: true }),
            supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('is_approved', false),
            supabase.from('profiles').select('*', { count: 'exact', head: true })
        ])

        return { totalClubs, pendingClubsCount, totalUsers }
    },
    ['admin-stats'],
    { revalidate: 30, tags: ['admin-stats'] }
)

const getPendingClubs = unstable_cache(
    async () => {
        const supabase = createSupabaseAnon()
        if (!supabase) return []

        const { data: pendingClubs } = await supabase
            .from('clubs')
            .select('*')
            .eq('is_approved', false)
            .order('created_at', { ascending: false })
            .limit(5)
        return pendingClubs
    },
    ['pending-clubs'],
    { revalidate: 30, tags: ['clubs', 'admin-stats'] }
)

export default async function AdminDashboard() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Admin Stats and pending clubs with cache
    const [{ totalClubs, pendingClubsCount, totalUsers }, pendingClubs] = await Promise.all([
        getAdminStats(),
        getPendingClubs()
    ])

    const stats = [
        { name: 'Total Clubs', value: totalClubs || 0, color: 'from-[#3B82F6] to-[#2563EB]', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { name: 'Pending Review', value: pendingClubsCount || 0, color: 'from-[#F59E0B] to-[#D97706]', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { name: 'Campus Members', value: totalUsers || 0, color: 'from-[#10B981] to-[#059669]', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    ]

    return (
        <div className="pb-12 text-foreground">
            <Header
                title="System Control"
                subtitle="INFRASTRUCTURE MONITORING"
                user={user}
            />

            <div className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-card border border-border p-8 rounded-[2.5rem] relative overflow-hidden group shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-500">
                            <div className="relative z-10">
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-3">{stat.name}</p>
                                <div className="flex items-baseline gap-3">
                                    <h2 className="text-5xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{stat.value}</h2>
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(155,44,44,0.5)]"></div>
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-muted rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700 flex items-center justify-center p-6">
                                <svg className="w-full h-full text-muted-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={stat.icon} />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Verification Queue */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b border-border pb-5">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">Verification Queue</h2>
                            <Link href="/dashboard/admin/verify-clubs" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all">Process All Nodes &rarr;</Link>
                        </div>

                        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl shadow-primary/5">
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-muted border-b border-border">
                                        <tr>
                                            <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Node Identity</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Broadcast Time</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {pendingClubs?.length > 0 ? pendingClubs.map(club => (
                                            <tr key={club.id} className="hover:bg-muted/50 transition-all group">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/50 font-black text-sm transition-all shadow-inner">
                                                            {club.name[0]}
                                                        </div>
                                                        <span className="font-bold text-foreground tracking-tight text-base group-hover:text-primary transition-colors">{club.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{new Date(club.created_at).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <Link href={`/dashboard/admin/clubs/${club.id}`} className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md shadow-primary/20">Review</Link>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="px-10 py-20 text-center text-muted-foreground/30 font-black text-[11px] uppercase tracking-[0.4em]">Signal clear - No pending nodes</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-border">
                                {pendingClubs?.length > 0 ? pendingClubs.map(club => (
                                    <div key={club.id} className="p-8 hover:bg-muted/50 transition-all">
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground font-black text-sm shadow-inner">
                                                {club.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground text-base">{club.name}</p>
                                                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mt-1">REQ_{new Date(club.created_at).getTime()}</p>
                                            </div>
                                        </div>
                                        <Link href={`/dashboard/admin/clubs/${club.id}`} className="block w-full text-center px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                            Review Interface
                                        </Link>
                                    </div>
                                )) : (
                                    <div className="p-20 text-center text-muted-foreground/30 font-black text-[11px] uppercase tracking-[0.4em]">No pending frequencies</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <div className="flex items-center justify-between border-b border-border pb-5">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">Core Registry</h2>
                        </div>
                        <div className="bg-card border border-border p-10 rounded-[3rem] shadow-xl shadow-primary/5 relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>

                            <div className="space-y-8 relative z-10">
                                {[
                                    { name: 'Total Nodes', count: totalClubs, color: 'bg-primary', path: '/dashboard/admin/all-clubs' },
                                    { name: 'Synced Nodes', count: (totalClubs || 0) - (pendingClubsCount || 0), color: 'bg-emerald-500', path: '/dashboard/admin/verified-clubs' },
                                    { name: 'Offline Nodes', count: 0, color: 'bg-muted-foreground/30', path: '/dashboard/admin/declined-clubs' },
                                ].map((item, i) => (
                                    <Link href={item.path} key={i} className="flex items-center justify-between group cursor-pointer border-b border-border/50 pb-5 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm`}></div>
                                            <span className="font-black text-muted-foreground text-[11px] group-hover:text-primary transition-colors uppercase tracking-[0.2em]">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{item.count}</span>
                                    </Link>
                                ))}
                            </div>
                            <Link href="/dashboard/members" className="w-full mt-12 py-5 bg-primary text-primary-foreground rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:opacity-90 block text-center transition-all shadow-lg shadow-primary/20 active:scale-95">
                                MANAGE SYSTEM USERS
                            </Link>
                        </div>

                        <div className="bg-gradient-to-br from-primary to-primary/90 border border-white/10 rounded-[3.5rem] p-10 relative overflow-hidden group shadow-2xl shadow-primary/20">
                            <div className="relative z-10 text-primary-foreground">
                                <h4 className="text-2xl font-black mb-3 tracking-tighter uppercase font-mono">Kernel Audit</h4>
                                <p className="text-primary-foreground/70 text-xs font-bold leading-relaxed mb-8 opacity-90">Review system-wide changes, authentication logs, and club transitions.</p>
                                <button className="px-10 py-4 bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/10 text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Access Logs
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/10 blur-3xl -mr-16 -mt-16 group-hover:opacity-20 transition-all duration-700"></div>
                            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
