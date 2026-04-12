import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AllAdminEvents() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch all events with club info
    const { data: events } = await supabase
        .from('events')
        .select(`
            *,
            clubs (
                name,
                logo_url
            )
        `)
        .order('event_date', { ascending: false })

    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title="Master Event Registry"
                subtitle="Complete overview of all campus activities and transmission statuses."
                user={user}
            />

            <div className="px-10">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Event & Club</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Schedule</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Database Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {events?.length > 0 ? events.map(event => (
                                <tr key={event.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                                                {event.clubs?.logo_url ? (
                                                    <img src={event.clubs.logo_url} alt="Club" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-black text-[#0b87bd] text-sm">{event.clubs?.name?.[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-[#1E1E2D] tracking-tight group-hover:text-[#0b87bd] transition-colors">{event.title}</h4>
                                                <p className="text-xs font-bold text-gray-400">{event.clubs?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-[#1E1E2D]">{new Date(event.event_date).toLocaleDateString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-2">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border ${event.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    event.status === 'draft' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                                        'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {event.status}
                                            </span>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border ${event.is_admin_approved ? 'bg-[#0b87bd]/5 text-[#0b87bd] border-[#0b87bd]/10' : 'bg-slate-50 text-slate-950 border-slate-100'
                                                }`}>
                                                {event.is_admin_approved ? '✓ Authorized' : '⧗ Pending Admin'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/dashboard/events/${event.id}`}
                                                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                                            >
                                                Details
                                            </Link>
                                            {!event.is_admin_approved && (
                                                <Link
                                                    href="/dashboard/admin/verify-events"
                                                    className="px-4 py-2 bg-[#0b87bd] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#096a96] transition-all"
                                                >
                                                    Process
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No entries in event registry</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
