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
      .limit(10);
    return events;
  },
  ['events-feed'],
  { revalidate: 60, tags: ['events'] }
);

export default async function Home() {
  const events = await getEvents();

  const heroWords = "Stay Connected. Broadcast Your Voice.".split(" ");

  return (
    <div className="flex flex-col min-h-screen selection:bg-orange-500/20 page-glow-container overflow-hidden">
      {/* Dynamic Circulating Beam */}
      <div className="circulating-beam"></div>

      {/* Decorative Floating Elements */}
      <div className="floating-element w-64 h-64 bg-orange-500 top-[10%] -left-32 animate-float"></div>
      <div className="floating-element w-96 h-96 bg-gray-300 bottom-[20%] -right-48 animate-float [animation-delay:2s]"></div>

      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-100/30 via-transparent to-transparent z-0"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 mb-10 text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 bg-orange-100/50 border border-orange-200/50 rounded-full w-fit backdrop-blur-md shadow-sm mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Campus Network Online
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.85] flex flex-wrap justify-center gap-x-4 md:gap-x-6">
            {heroWords.map((word, i) => (
              <span
                key={i}
                className="animate-word"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {word}
              </span>
            ))}
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium mb-16 leading-relaxed animate-fade-in [animation-delay:0.8s]">
            The unified platform for university organizations to orchestrate events, manage talent, and maintain verified campus communications.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in [animation-delay:1s]">
            <Link href="/auth/register" className="w-full sm:w-auto bg-slate-900 text-white hover:bg-black font-black px-12 py-5 rounded-full transition-all shadow-xl hover:scale-[1.05] active:scale-[0.98] text-center text-sm uppercase tracking-widest">
              Join the Movement
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto bg-white/50 border border-slate-200 hover:border-orange-200 text-slate-900 font-bold px-12 py-5 rounded-full transition-all backdrop-blur-md shadow-sm text-center text-sm uppercase tracking-widest">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Events Feed Section */}
      <section id="events" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-6 underline decoration-orange-500 decoration-4 underline-offset-8">Explore Feed</h2>
            <p className="text-slate-500 font-medium">Lately in our campus ecosystem</p>
          </div>

          {!events || events.length === 0 ? (
            <div className="glass-card p-20 text-center rounded-[3rem] relative overflow-hidden bg-white/80 shadow-2xl shadow-orange-500/5">
              <div className="text-7xl mb-8">📡</div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Quiet Transmission</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                No published events found in the current transmission cycle.
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {events.map((event) => (
                <div key={event.id} className="glass-card rounded-[2.5rem] overflow-hidden group hover:bg-white/90 transition-all duration-500 shadow-xl shadow-slate-200/50">
                  {/* Feed Header */}
                  <div className="p-8 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center font-black text-orange-600 text-sm shadow-inner overflow-hidden">
                        {event.clubs?.logo_url ? (
                          <img src={event.clubs.logo_url} className="w-full h-full object-cover" />
                        ) : (
                          event.clubs?.name?.[0] || 'C'
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 tracking-tight text-lg">{event.clubs?.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                          {new Date(event.created_at).toLocaleDateString()} &bull; Broadcast
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-1.5 bg-green-50 rounded-full text-[10px] font-black text-green-600 uppercase tracking-widest border border-green-100 shadow-sm animate-pulse">
                      Live
                    </div>
                  </div>

                  {/* Feed Content */}
                  <div className="p-10">
                    <h3 className="text-3xl md:text-4xl font-black mb-6 text-slate-900 group-hover:text-orange-600 transition-colors tracking-tighter leading-[1.1]">
                      {event.title}
                    </h3>
                    <p className="text-slate-600 text-lg font-medium mb-10 leading-relaxed max-w-2xl">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap gap-4 mb-10">
                      <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-xs font-bold shadow-sm">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {event.location}
                      </div>
                      <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-xs font-bold shadow-sm">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.event_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="inline-flex items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-900 group/btn bg-orange-100/50 pr-1 pl-6 py-1 rounded-full border border-orange-200/30 hover:bg-orange-500 hover:text-white transition-all duration-300"
                    >
                      View Full Briefing
                      <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-md group-hover/btn:translate-x-1 transition-transform">
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 md:py-48 relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
            {[
              { val: '30+', label: 'Clubs' },
              { val: '1.2k', label: 'Nodes' },
              { val: '150+', label: 'Events' },
              { val: '100%', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-5xl md:text-8xl font-black text-slate-900 mb-4 tracking-[ -0.05em] group-hover:text-orange-500 transition-colors duration-500">{stat.val}</div>
                <div className="text-[11px] uppercase font-black tracking-[0.5em] text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

