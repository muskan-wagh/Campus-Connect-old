import { createSupabaseServer, createSupabaseAnon } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'

// Cached fetching function
const getCachedClubs = unstable_cache(
    async (filter) => {
        const supabase = createSupabaseAnon()
        if (!supabase) return []

        let query = supabase
            .from('clubs')
            .select(`
                *,
                club_members (
                    user_id,
                    role,
                    profiles (full_name, avatar_url)
                )
            `)
            .order('created_at', { ascending: false })

        if (filter === 'verified') {
            query = query.eq('is_approved', true)
        } else if (filter === 'pending') {
            query = query.eq('is_approved', false)
        }

        const { data, error } = await query
        if (error) throw error

        return data?.map(club => {
            const members = club.club_members || []
            const leads = members.filter(m => m.role === 'lead' || m.role === 'club_lead')
            return {
                ...club,
                memberCount: members.length,
                leads: leads.map(l => l.profiles)
            }
        }) || []
    },
    ['clubs-list'],
    { revalidate: 60, tags: ['clubs'] }
)

export default async function AllClubs({ searchParams }) {
    const params = await searchParams
    const filter = params.filter || 'all'

    const clubs = await getCachedClubs(filter)

    return (
        <div className="pb-12 text-slate-900">
            <Header
                title="Campus Clubs"
                subtitle="EXPLORE ALL LOGICAL NODES"
            />

            <div className="px-2">
                {/* Filter Tabs - Now using Links for faster SSR transitions */}
                <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 scrollbar-none">
                    {['all', 'verified', 'pending'].map((status) => (
                        <Link
                            key={status}
                            href={`/dashboard/clubs?filter=${status}`}
                            className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap border-2 ${filter === status
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200'
                                : 'bg-white text-slate-400 border-slate-50 hover:text-orange-600 hover:border-orange-100 hover:bg-orange-50/30'
                                }`}
                        >
                            {status}
                        </Link>
                    ))}
                </div>

                {clubs.length === 0 ? (
                    <div className="bg-white rounded-[4rem] p-32 text-center border-2 border-dashed border-slate-50 shadow-2xl shadow-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full"></div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Void_Signal</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mb-10 opacity-80">
                                {filter === 'all'
                                    ? "No active clusters have been initialized in this sector."
                                    : `No ${filter} frequencies detected in the local grid.`}
                            </p>
                            <Link href="/dashboard/clubs/new" className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl hover:shadow-orange-500/20 active:scale-95">
                                Initialize New Node
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {clubs.map((club) => (
                            <Link
                                key={club.id}
                                href={`/dashboard/clubs/${club.id}`}
                                className="bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 group flex flex-col h-full relative"
                            >
                                {/* Cover Image */}
                                <div className="h-56 bg-slate-50 relative overflow-hidden shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent z-10 opacity-80"></div>
                                    {club.cover_image ? (
                                        <img
                                            src={club.cover_image}
                                            alt={club.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 relative">
                                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                            <svg className="w-20 h-20 text-slate-100 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-8 right-8 z-20">
                                        <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-md shadow-lg ${club.is_approved
                                            ? 'bg-orange-500 text-white border-orange-400 shadow-orange-500/20'
                                            : 'bg-white/90 text-slate-400 border-slate-100'
                                            }`}>
                                            {club.is_approved ? '✓ Verified' : 'Syncing'}
                                        </span>
                                    </div>

                                    {/* Logo Overlay */}
                                    {club.logo_url && (
                                        <div className="absolute bottom-0 left-10 transform translate-y-1/2 z-20">
                                            <div className="w-20 h-20 rounded-[1.5rem] bg-white border-4 border-white shadow-2xl overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                                <img
                                                    src={club.logo_url}
                                                    alt={`${club.name} logo`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-10 pt-14 flex flex-col flex-grow relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-all"></div>

                                    <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-orange-600 transition-colors line-clamp-1 tracking-tighter uppercase leading-none">
                                        {club.name}
                                    </h3>

                                    <p className="text-sm text-slate-400 font-bold line-clamp-2 mb-10 leading-relaxed opacity-80">
                                        {club.description || 'No data broadcast detected from this coordinate.'}
                                    </p>

                                    {/* Stats Card */}
                                    <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-3">
                                                {club.leads.slice(0, 3).map((lead, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-10 h-10 rounded-xl border-[3px] border-white bg-slate-50 overflow-hidden shrink-0 shadow-sm"
                                                    >
                                                        {lead?.avatar_url ? (
                                                            <img
                                                                src={lead.avatar_url}
                                                                alt={lead.full_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-black">
                                                                {lead?.full_name?.[0]?.toUpperCase() || 'L'}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {club.leads.length > 3 && (
                                                    <div className="w-10 h-10 rounded-xl border-[3px] border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                                                        +{club.leads.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner group-hover:shadow-orange-500/20">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="text-xs font-black tracking-tighter">{club.memberCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
