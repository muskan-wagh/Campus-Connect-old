import { requireRole } from '@/lib/supabase/server'

export default async function StudentLayout({ children }) {
  await requireRole(['student'])
  return <>{children}</>
}
