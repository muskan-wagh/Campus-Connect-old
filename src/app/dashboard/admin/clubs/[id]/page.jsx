import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function ClubReview({ params }) {
    const { id } = await params
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: club } = await supabase
        .from('clubs')
        .select(`
            *,
            club_members(
                role,
                profiles(full_name, email)
            )
        `)
        .eq('id', id)
        .single()

    if (!club) {
        return <div className="p-10 text-center">Protocol Error: Club instance not found.</div>
    }

    const lead = club.club_members.find(m => m.role === 'lead')?.profiles

    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title="Club Intelligence Review"
                subtitle={`Analyzing registration data for ${club.name}`}
                user={user}
            />

            <div className="px-10 max-w-4xl">
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-[#f5f7f9] rounded-[1.5rem] flex items-center justify-center text-4xl">
                                🏢
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">{club.name}</h2>
                                <p className="text-gray-500 font-medium">Internal ID: {club.id}</p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${club.is_approved ? 'bg-[#0b87bd]/10 text-[#0b87bd]' : 'bg-slate-950/10 text-slate-950'}`}>
                            {club.is_approved ? 'Verified' : 'Awaiting Review'}
                        </div>
                    </div>

                    <div className="p-10 space-y-12">
                        <section>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Mission Statement</h3>
                            <p className="text-gray-900 font-medium leading-relaxed bg-[#f5f7f9] p-8 rounded-2xl border border-gray-100 italic">
                                "{club.description}"
                            </p>
                        </section>

                        <div className="grid grid-cols-2 gap-10">
                            <section>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Leadership Identity</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-black text-xs">
                                        {lead?.full_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-[#1E1E2D]">{lead?.full_name || 'Anonymous Lead'}</p>
                                        <p className="text-xs text-gray-500 font-medium">{lead?.email}</p>
                                    </div>
                                </div>
                            </section>
                            <section>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Registration Analytics</h3>
                                <p className="text-sm font-bold text-[#1E1E2D]">Submitted: <span className="text-gray-500">{new Date(club.created_at).toLocaleDateString()}</span></p>
                                <p className="text-sm font-bold text-[#1E1E2D]">Member Count: <span className="text-gray-500">{club.club_members.length}</span></p>
                            </section>
                        </div>

                        <div className="pt-10 border-t border-gray-100 flex items-center gap-4">
                            <form action={async () => {
                                'use server'
                                const s = await createSupabaseServer()

                                // Get the lead's user_id first
                                const { data: members } = await s
                                    .from('club_members')
                                    .select('user_id')
                                    .eq('club_id', id)
                                    .eq('role', 'lead')
                                    .single()

                                const { error: updateError } = await s.from('clubs').update({ is_approved: true }).eq('id', id)
                                if (updateError) {
                                    throw new Error(`Approval failed: ${updateError.message}`)
                                }

                                // Create notification for the lead
                                if (members?.user_id) {
                                    await s.from('notifications').insert({
                                        user_id: members.user_id,
                                        title: 'Club Verified',
                                        message: `Great news! "${club.name}" has been officially verified by the administration. You can now manage events.`,
                                        type: 'success',
                                        link: `/dashboard/lead`
                                    })
                                }

                                revalidatePath('/dashboard/admin')
                                revalidatePath('/dashboard/admin/verify-clubs')
                                revalidatePath('/dashboard/clubs')
                                redirect('/dashboard/admin/verify-clubs')
                            }} className="flex-grow">
                                <button className="w-full py-4 bg-[#0b87bd] hover:bg-[#096a96] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#0b87bd]/20">
                                    Approve Organization
                                </button>
                            </form>
                            <form action={async () => {
                                'use server'
                                const s = await createSupabaseServer()
                                // In a real app we might delete or mark as declined
                                const { error: deleteError } = await s.from('clubs').delete().eq('id', id)
                                if (deleteError) {
                                    throw new Error(`Rejection failed: ${deleteError.message}`)
                                }
                                revalidatePath('/dashboard/admin')
                                revalidatePath('/dashboard/admin/verify-clubs')
                                revalidatePath('/dashboard/clubs')
                                redirect('/dashboard/admin/verify-clubs')
                            }}>
                                <button className="px-10 py-4 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
                                    Reject
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
