import Link from 'next/link';
import { createSupabaseAnon } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

const getEvents = unstable_cache(
  async () => {
    const supabase = createSupabaseAnon();
    if (!supabase) return [];

    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        clubs (
          name,
          logo_url
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(6);
    return events;
  },
  ['events-feed'],
  { revalidate: 60, tags: ['events'] }
);

export default async function Home() {
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-8 md:px-12 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/" className="text-xl font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
            </div>
            <span>Campus<span className="text-primary">Connect</span></span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-12 pointer-events-auto bg-card/20 backdrop-blur-xl px-10 py-4 rounded-full border border-border/30 shadow-2xl shadow-primary/5">
          {['Home', 'Platform', 'Network', 'Archive'].map((item) => (
            <Link key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
              {item}
            </Link>
          ))}
        </div>

        <div className="pointer-events-auto flex items-center gap-4">
          <Link href="/auth/login" className="px-8 py-3.5 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-xl shadow-foreground/10 active:scale-95">
            Log In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-48 pb-20 px-6">
        {/* Background Graphic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/5 rounded-full blur-[140px] animate-pulse"></div>
          <div className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-secondary/30 rounded-full blur-[120px]"></div>

          {/* Subtle Abstract Wave Shape (SVG representation) */}
          <div className="absolute bottom-[-10%] left-0 w-full opacity-[0.03] scale-150">
            <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 1000V0C233 0 355 58 522 58C689 58 810 0 1000 0V1000H0Z" fill="var(--primary)" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl w-full text-center">
          <div className="inline-block px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full mb-10 animate-fade-in">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Intelligence Synchronized</span>
          </div>

          <h1 className="text-[10vw] md:text-[6.5rem] font-serif leading-[0.85] text-foreground mb-12 tracking-tighter animate-fade-in [animation-delay:200ms]">
            Empowering Your <br />
            <span className="italic font-light opacity-80 decoration-primary/20 decoration-4">Campus Journey.</span>
          </h1>

          <p className="max-w-xl mx-auto text-muted-foreground text-base md:text-xl font-medium leading-relaxed mb-16 animate-fade-in [animation-delay:400ms] opacity-70">
            The unified infrastructure for university organizations to manage talent, broadcast events, and maintain verified communications.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in [animation-delay:600ms]">
            <Link href="/auth/register" className="w-full sm:w-auto px-14 py-6 bg-foreground text-background rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-2xl shadow-foreground/20 active:scale-95">
              Explore Now
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Row Wrapper */}
      <section className="max-w-7xl mx-auto px-6 mb-40 animate-fade-in [animation-delay:800ms]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-card/40 backdrop-blur-3xl border-2 border-white/50 rounded-[4rem] p-12 md:p-20 shadow-2xl shadow-primary/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700"></div>

          {[
            { label: 'Active Clusters', val: '42' },
            { label: 'Throughput', val: '+1.8k' },
            { label: 'Sync Success', val: '99%' }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center md:items-start space-y-6">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/50">{stat.label}</span>
              <div className="text-7xl md:text-8xl font-serif text-foreground tracking-tighter">{stat.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Transmissions Feed */}
      <section id="network" className="max-w-7xl mx-auto px-6 pb-40">
        <div className="flex items-center justify-between gap-6 mb-24">
          <div className="flex items-center gap-10">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground tracking-tighter">Live Network</h2>
            <div className="hidden md:flex flex-grow h-px bg-border max-w-[200px]"></div>
          </div>
          <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b-2 border-primary/20 pb-2 hover:border-primary transition-all">
            Access Full Grid &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {events?.map((event) => (
            <article key={event.id} className="group p-10 bg-card/20 border border-border/50 rounded-[3rem] hover:bg-card/50 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-muted border border-border overflow-hidden p-0.5 group-hover:border-primary/50 transition-colors">
                    {event.clubs?.logo_url ? (
                      <img src={event.clubs.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-black text-[10px]">
                        {event.clubs?.name?.[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">{event.clubs?.name}</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-serif text-foreground mb-6 group-hover:text-primary transition-colors tracking-tight leading-tight uppercase">
                  {event.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed font-light line-clamp-2 opacity-80 mb-10">
                  {event.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-border/50">
                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                  Received: {new Date(event.created_at).toLocaleDateString()}
                </span>
                <Link href={`/dashboard/events/${event.id}`} className="p-4 bg-muted rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer Area */}
      <footer className="border-t border-border py-20 bg-card/20 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full -mt-[400px]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="text-2xl font-black uppercase tracking-[0.3em]">Campus<span className="text-primary">Connect</span></span>
            <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground/50 font-black">All Systems Operational // 2026</p>
          </div>

          <div className="flex gap-12">
            {['Privacy', 'Network Status', 'Admin Protocol', 'Contact'].map(item => (
              <Link key={item} href="#" className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
