import { createSupabaseServer, getUserProfile } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { unstable_cache } from 'next/cache'

export const revalidate = 60 // Revalidate every 60 seconds

const getCachedMembers = unstable_cache(
    async () => {
        const supabase = await createSupabaseServer()
        if (!supabase) return []

        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                club_members (
                    club_id,
                    role,
                    clubs (
                        name
                    )
                )
            `)
            .order('full_name', { ascending: true })

        if (error) throw error
        return data || []
    },
    ['members-list'],
    { revalidate: 60, tags: ['members'] }
)

export default async function MembersPage() {
    const { user, profile: currentUserProfile } = await getUserProfile()

    if (!user) redirect('/auth/login')
    const userRole = (currentUserProfile?.role || 'student').toLowerCase().trim()
    const isAdmin = userRole === 'admin'

    const members = await getCachedMembers()

    return (
        <div className="pb-12 text-slate-900">
            <Header
                title="Campus Directory"
                subtitle={isAdmin ? "CORE MEMBER REGISTRY & ACCESS CONTROL" : "BROWSE ALL REGISTERED NODES"}
                user={user}
            />

            <div className="px-6 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {members && members.length > 0 ? members.map(member => (
                        <div key={member.id} className="bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-10 relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500">
                            {/* Accent Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-950/5 blur-3xl -mr-16 -mt-16 group-hover:bg-slate-950/10 transition-all"></div>

                            {/* Profile Photo & Identity */}
                            <div className="flex items-center gap-5 md:gap-6 mb-8 md:mb-12 relative z-10">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 p-1 md:p-1.5 group-hover:border-slate-200 transition-all shrink-0 shadow-inner">
                                    <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-white flex items-center justify-center relative">
                                        {member.avatar_url ? (
                                            <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-200">
                                                {member.full_name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter mb-1 md:mb-2 uppercase truncate group-hover:text-slate-950 transition-colors">
                                        {member.full_name}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full shadow-sm ${member.role === 'admin' ? 'bg-red-500' : member.role === 'club_lead' ? 'bg-slate-950' : 'bg-green-500'}`}></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{member.role?.replace('_', ' ')} NODE</p>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Specs (Bio/Info) */}
                            <div className="space-y-8 mb-12 relative z-10">
                                <div className="grid grid-cols-1 gap-5">
                                    <div className="flex items-center gap-5 group/item bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/item:text-slate-950 transition-colors border border-slate-50">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        </div>
                                        <span className="text-xs font-black text-slate-500 group-hover/item:text-slate-900 transition-colors truncate uppercase tracking-tight">{member.institute_name || 'UNIV_SYNC_NULL'}</span>
                                    </div>

                                    {member.degree && (
                                        <div className="flex items-center gap-5 group/item bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/item:text-slate-950 transition-colors border border-slate-50">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{member.education_level}</span>
                                                <span className="text-xs font-black text-slate-900 group-hover/item:text-slate-950 transition-colors truncate">{member.degree}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-5 group/item">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-slate-950 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 group-hover/item:text-slate-900 transition-colors uppercase tracking-[0.3em]">{member.academic_year || 'SYNC_YEAR_PENDING'}</span>
                                    </div>
                                </div>

                                {/* Club Affiliations */}
                                {member.club_members && member.club_members.length > 0 && (
                                    <div className="pt-10 border-t border-slate-50">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6">Operational Affiliations</p>
                                        <div className="flex flex-wrap gap-3">
                                            {member.club_members.map((membership, idx) => (
                                                <div key={idx} className="px-4 py-2 bg-slate-50 rounded-xl flex items-center gap-3 border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group/chip">
                                                    <span className="text-[10px] font-black text-slate-600 group-hover/chip:text-slate-950 truncate max-w-[120px] uppercase tracking-tight">{membership.clubs?.name}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 group-hover/chip:bg-slate-800"></span>
                                                    <span className="text-[9px] font-black text-slate-400 group-hover/chip:text-slate-950 uppercase tracking-tighter shrink-0">{membership.role}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Metadata / Footer */}
                            <div className="pt-10 border-t border-slate-50 flex items-center justify-between relative z-10">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                                    UPTIME INIT: {new Date(member.created_at).toLocaleDateString()}
                                </span>

                                {isAdmin && member.id !== user.id && (
                                    <form action={async () => {
                                        'use server'
                                        const s = await createSupabaseServer()
                                        await s.from('profiles').delete().eq('id', member.id)
                                        await s.auth.admin.deleteUser(member.id)
                                        revalidatePath('/dashboard/members')
                                    }}>
                                        <button className="px-8 py-3 bg-white hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-red-100 hover:border-red-600 shadow-sm active:scale-95">
                                            Purge
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[4rem] p-12 md:p-32 text-center relative overflow-hidden shadow-2xl shadow-slate-100">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-slate-950/5 blur-[100px] rounded-full"></div>
                            <div className="relative z-10 space-y-6 md:space-y-8">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner text-slate-200">
                                    <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Registry Null</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-[11px] max-w-sm mx-auto leading-relaxed">No active campus frequencies detected within the current coordinate set.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
