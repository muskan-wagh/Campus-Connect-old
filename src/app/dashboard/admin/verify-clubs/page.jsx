import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

export default async function VerifyClubs() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: pendingClubs } = await supabase
        .from('clubs')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })

    return (
        <div className="pb-12 text-foreground">
            <Header
                title="Validation Queue"
                subtitle="REVIEW & AUTHORIZE NEW NODE INITIALIZATION"
                user={user}
            />

            <div className="px-6 md:px-10">
                <div className="space-y-6">
                    {pendingClubs?.length > 0 ? pendingClubs.map(club => (
                        <div key={club.id} className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-xl shadow-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-2xl hover:shadow-primary/10 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all"></div>

                            <div className="flex items-center gap-5 md:gap-8 relative z-10">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-muted-foreground/20 group-hover:text-primary transition-colors shrink-0 shadow-inner">
                                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xl md:text-2xl font-black mb-1 group-hover:text-primary transition-colors uppercase tracking-tight truncate leading-none">{club.name}</h3>
                                    <p className="text-muted-foreground text-sm font-light line-clamp-1 mb-2 leading-relaxed opacity-80">{club.description || 'No data broadcast detected.'}</p>
                                    <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">REQUEST_RECV: {new Date(club.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 relative z-10">
                                <Link href={`/dashboard/admin/clubs/${club.id}`} className="w-full md:w-auto text-center px-10 py-4 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
                                    Access Briefing
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-card rounded-[2.5rem] p-16 md:p-32 text-center border shadow-2xl shadow-primary/5 border-border relative overflow-hidden group">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 blur-[80px] rounded-full"></div>
                            <div className="relative z-10">
                                <p className="text-muted-foreground/20 font-black uppercase tracking-[0.5em] text-[10px] md:text-xs">QUEUE_EMPTY: ALL FREQUENCIES VERIFIED</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
