import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export default async function ProfilePage() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) return null

    return (
        <div className="pb-12 text-white">
            <Header
                title="Profile Identity"
                subtitle="CORE AUTHENTICATION NODE"
                user={user}
            />

            <div className="max-w-4xl mx-auto mt-10">
                <div className="bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200/50">
                    {/* Cover / Header Section */}
                    <div className="h-40 md:h-64 relative">
                        {profile.cover_image ? (
                            <img src={profile.cover_image} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-200/20 to-transparent"></div>
                            </div>
                        )}
                        <div className="absolute -bottom-12 md:-bottom-16 left-6 md:left-12 flex items-end gap-4 md:gap-6 z-20">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-white p-1 border-4 border-white shadow-2xl relative group">
                                <div className="w-full h-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-slate-50 flex items-center justify-center">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl md:text-4xl font-black text-white">{profile.full_name?.[0]}</span>
                                    )}
                                </div>
                            </div>
                            <div className="mb-2 md:mb-4">
                                <h1 className="text-xl md:text-4xl font-serif tracking-tight text-slate-900 leading-tight">{profile.full_name}</h1>
                                <p className="text-slate-400 font-bold text-[8px] md:text-[10px] uppercase tracking-[0.3em]">{profile.role?.replace('_', ' ')} NODE</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats / Info Bar */}
                    <div className="mt-16 md:mt-24 px-6 md:px-12 pb-12 md:pb-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 pt-8">
                            <div className="space-y-10">
                                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-50">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 border-b border-slate-100 pb-4">Official Identification</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-5 group">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Email Coordinate</p>
                                                <p className="text-sm font-bold text-slate-900">{profile.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 group">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Nexus / Institute</p>
                                                <p className="text-sm font-bold text-slate-900">{profile.institute_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-50">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 border-b border-slate-100 pb-4">Academic Protocol</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-5 group">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Degree Level</p>
                                                <p className="text-sm font-bold text-slate-900">{profile.education_level} - {profile.degree}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 group">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Cycle / Year</p>
                                                <p className="text-sm font-bold text-slate-900">{profile.academic_year}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col justify-center shadow-2xl shadow-slate-950/20">
                                <div className="relative z-10 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
                                        <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <h4 className="text-xl md:text-2xl font-serif mb-4 tracking-tight">Sync Security</h4>
                                    <p className="text-slate-400 text-[10px] md:text-[11px] font-medium leading-relaxed mb-8 md:mb-10 italic max-w-xs mx-auto">Your node is currently active and verified. Security protocols are fully operational across all sectors.</p>
                                    <Link href="/dashboard/profile/edit" className="inline-block px-8 md:px-12 py-4 md:py-5 bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl md:rounded-2xl hover:bg-slate-100 transition-all active:scale-95">Update Identity Protocl</Link>
                                </div>
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-3xl -mr-24 -mt-24"></div>
                                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
