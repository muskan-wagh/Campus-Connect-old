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

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-20 md:pt-32 pb-16 md:pb-24 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="flex-1">
            <h1 className="text-6xl md:text-9xl font-serif leading-[0.8] mb-12 animate-fade-in">
              Campus <br /> Connect<span className="text-slate-300">.</span>
            </h1>

            <p className="max-w-md text-[10px] uppercase tracking-[0.3em] font-medium text-slate-400 leading-loose animate-fade-in [animation-delay:200ms]">
              The unified platform for university organizations to orchestrate events, manage talent, and maintain verified campus communications.
            </p>
          </div>

          <div className="flex gap-4 animate-fade-in [animation-delay:400ms]">
            <Link href="/auth/register" className="btn-primary">
              Join the Movement
            </Link>
            <Link href="/auth/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">

          {/* Left Column: Network & About */}
          <div className="lg:col-span-4 space-y-24 md:space-y-32">

            {/* 01. The Network */}
            <section className="animate-fade-in [animation-delay:600ms]">
              <div className="flex items-center gap-3 mb-12">
                <span className="font-serif italic text-2xl">01.</span>
                <h2 className="text-xl font-serif">The Network</h2>
              </div>

              <div className="space-y-8">
                {[
                  { label: 'Active Clubs', val: '30+' },
                  { label: 'Registered Nodes', val: '1.2k' },
                  { label: 'Events Hosted', val: '150+' },
                  { label: 'System Uptime', val: '100%' }
                ].map((stat, i) => (
                  <div key={i} className="flex items-end justify-between border-b border-slate-50 pb-4">
                    <span className="journal-label mb-0">{stat.label}</span>
                    <span className="text-2xl font-serif">{stat.val}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 02. About */}
            <section className="animate-fade-in [animation-delay:800ms]">
              <div className="flex items-center gap-3 mb-12">
                <span className="font-serif italic text-2xl">02.</span>
                <h2 className="text-xl font-serif">About</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-light">
                Inspired by high-fashion print and premium digital journals. Our platform contrasts stark, clean whitespace with structured content layouts to evoke a deliberate reading and event management experience.
              </p>
            </section>
          </div>

          {/* Right Column: Feed */}
          <div className="lg:col-span-8">
            <section className="animate-fade-in [animation-delay:1s]">
              <div className="flex items-center gap-3 mb-12">
                <span className="font-serif italic text-2xl">03.</span>
                <h2 className="text-xl font-serif">Latest Transmissions</h2>
              </div>

              {!events || events.length === 0 ? (
                <div className="border border-slate-100 p-24 text-center bg-slate-50/50">
                  <h3 className="font-serif italic text-4xl text-slate-300 mb-6 font-light">Quiet</h3>
                  <div className="journal-label">No Active Broadcasts</div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">
                    The network is currently silent. Check back later for new transmissions.
                  </p>
                </div>
              ) : (
                <div className="space-y-24">
                  {events.map((event) => (
                    <article key={event.id} className="group cursor-pointer">
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <span className="journal-label mb-0">{event.clubs?.name}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="journal-label mb-0">{new Date(event.created_at).toLocaleDateString()}</span>
                          </div>

                          <h3 className="text-2xl md:text-4xl font-serif mb-4 md:mb-6 group-hover:text-slate-600 transition-colors leading-snug">
                            {event.title}
                          </h3>

                          <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-xl font-light">
                            {event.description}
                          </p>

                          <Link
                            href={`/dashboard/events/${event.id}`}
                            className="inline-block text-[10px] uppercase tracking-[0.3em] font-bold border-b border-black pb-1 hover:text-slate-500 hover:border-slate-500 transition-all"
                          >
                            Read Full Briefing
                          </Link>
                        </div>

                        <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-300 rotate-90 origin-left mt-8 whitespace-nowrap hidden md:block">
                          TRANSMISSION NO. {event.id.slice(0, 8)}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
