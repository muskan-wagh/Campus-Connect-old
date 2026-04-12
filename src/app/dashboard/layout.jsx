import { getUserProfile, createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClientLayout from '@/components/dashboard/DashboardClientLayout'

export default async function DashboardLayout({ children }) {
    let { user, profile } = await getUserProfile()

    if (!user) {
        redirect('/auth/login')
    }

    const supabase = await createSupabaseServer()

    // SELF-HEALING: If profile is missing in the profiles table, 
    // reconstruct it from user_metadata (which exists if they registered via our form)
    if (!profile && user.user_metadata) {
        profile = {
            id: user.id,
            full_name: user.user_metadata.full_name || user.email.split('@')[0],
            role: user.user_metadata.role || 'student',
            institute_name: user.user_metadata.institute_name || 'Campus Connect',
            avatar_url: user.user_metadata.avatar_url || null,
            email: user.email
        }

        try {
            await supabase.from('profiles').upsert(profile)
        } catch (e) {
            console.error('Record repair failed:', e.message)
        }
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center selection:bg-slate-100 selection:text-slate-900">
                <div className="max-w-md w-full bg-white border border-slate-100 rounded-[3rem] p-12 shadow-2xl shadow-slate-200 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-slate-950 to-slate-300"></div>
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-950/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                        <span className="text-4xl">📡</span>
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Identity_Desync</h1>
                    <p className="text-slate-400 font-bold mb-10 leading-relaxed text-sm opacity-80">
                        Node identified but <span className="text-slate-950">profile data packet</span> is missing. The synchronization handshake was interrupted during initialization.
                    </p>

                    <div className="space-y-4 relative z-10">
                        <form action="/auth/login" method="get">
                            <button
                                type="submit"
                                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-950 transition-all text-[10px] uppercase tracking-[0.3em] shadow-lg hover:shadow-slate-950/20 active:scale-95"
                            >
                                Reconnect Node
                            </button>
                        </form>
                        <form action="/api/auth/sign-out" method="post">
                            <button
                                type="submit"
                                className="w-full bg-white text-slate-400 font-bold py-5 rounded-2xl hover:text-slate-900 transition-all text-[10px] uppercase tracking-[0.2em] border border-slate-100 hover:border-slate-200"
                            >
                                Terminate Session
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <DashboardClientLayout user={user} profile={profile} >
            {children}
        </DashboardClientLayout>
    )
}
