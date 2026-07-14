import { requireRole } from '@/lib/supabase/server'

export default async function LeadLayout({ children }) {
  await requireRole(['club_lead'])
  return <>{children}</>
}
