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
        <div className="pb-12 text-foreground">
            <Header
                title="Master Event Registry"
                subtitle="Complete overview of all campus activities and transmission statuses."
                user={user}
            />

            <div className="px-10">
                <div className="bg-card rounded-[2.5rem] border border-border shadow-xl shadow-primary/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Event & Club</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Schedule</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Database Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {events?.length > 0 ? events.map(event => (
                                    <tr key={event.id} className="hover:bg-muted transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center overflow-hidden border border-border">
                                                    {event.clubs?.logo_url ? (
                                                        <img src={event.clubs.logo_url} alt="Club" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-black text-primary text-sm">{event.clubs?.name?.[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{event.title}</h4>
                                                    <p className="text-xs font-bold text-muted-foreground">{event.clubs?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-foreground">{new Date(event.event_date).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border ${event.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                    event.status === 'draft' ? 'bg-muted text-muted-foreground border-border' :
                                                        'bg-destructive/10 text-destructive border-destructive/20'
                                                    }`}>
                                                    {event.status}
                                                </span>
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border ${event.is_admin_approved ? 'bg-primary/5 text-primary border-primary/20' : 'bg-muted text-foreground border-border'
                                                    }`}>
                                                    {event.is_admin_approved ? '✓ Authorized' : '⧗ Pending Admin'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/dashboard/events/${event.id}`}
                                                    className="px-4 py-2 bg-card border border-border text-muted-foreground rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all"
                                                >
                                                    Details
                                                </Link>
                                                {!event.is_admin_approved && (
                                                    <Link
                                                        href="/dashboard/admin/verify-events"
                                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
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
                                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                                    <svg className="w-8 h-8 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No entries in event registry</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
