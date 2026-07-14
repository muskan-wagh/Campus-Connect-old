import { createSupabaseAnon } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import EventsSection from '@/components/landing/EventsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

const getEvents = unstable_cache(
  async () => {
    const supabase = createSupabaseAnon();
    if (!supabase) return [];

    const { data: events } = await supabase
      .from('events')
      .select('*, clubs(name, logo_url)')
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
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <EventsSection events={events} />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
