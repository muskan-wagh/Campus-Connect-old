import { createSupabaseServer } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function EventDetails({ params }) {
    const { eventId } = await params;
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    const { data: event } = await supabase
        .from('events')
        .select(`
      *,
      clubs (
        id,
        name,
        description
      )
    `)
        .eq('id', eventId)
        .single();

    if (!event) notFound();

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-foreground">
            <div className="mb-10">
                <Link href="/dashboard" className="text-sm font-black text-muted-foreground hover:text-primary transition-all mb-4 inline-flex items-center gap-2 group uppercase tracking-widest">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Workspace
                </Link>
            </div>

            <div className="bg-card rounded-[3.5rem] overflow-hidden border border-border shadow-2xl shadow-primary/5 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32 rounded-full"></div>

                <div className="p-10 md:p-16 relative z-10">
                    <div className="flex flex-wrap items-center gap-5 mb-10">
                        <span className="px-5 py-2 bg-muted border border-border text-primary text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm">
                            {event.clubs?.name}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                        <span className="text-muted-foreground text-[11px] font-black uppercase tracking-widest">
                            {new Date(event.event_date).toLocaleString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-foreground mb-12 tracking-tighter leading-[1]">
                        {event.title}
                    </h1>

                    <div className="flex flex-col md:flex-row gap-16 mb-16">
                        <div className="flex-grow">
                            <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-3 tracking-tight">
                                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                </div>
                                Broadcast Content
                            </h2>
                            <p className="text-muted-foreground leading-relaxed text-lg font-medium whitespace-pre-wrap opacity-90">
                                {event.description}
                            </p>
                        </div>

                        <div className="md:w-72 space-y-8">
                            <div className="p-8 rounded-[2rem] bg-muted/50 border border-border shadow-inner">
                                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6">Location Site</h3>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shadow-sm border border-border shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-foreground font-bold text-base leading-tight mt-2">{event.location}</span>
                                </div>
                            </div>

                            <div className="p-8 rounded-[2rem] bg-card border border-border shadow-2xl shadow-primary/5">
                                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6">Source Cluster</h3>
                                <Link href={`/dashboard/clubs/${event.clubs?.id}`} className="block group">
                                    <div className="text-foreground font-black text-lg group-hover:text-primary transition-colors leading-tight">{event.clubs?.name}</div>
                                    <div className="text-[9px] font-black text-primary mt-2 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">View Profile →</div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-6 pt-12 border-t border-border">
                        <button className="bg-primary text-primary-foreground hover:opacity-90 font-black px-10 py-5 rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-primary/20 active:scale-95">
                            Save Transmission
                        </button>
                        <div className="flex gap-4">
                            <button className="p-5 bg-card border border-border rounded-2xl hover:bg-muted hover:border-primary/50 transition-all group shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
