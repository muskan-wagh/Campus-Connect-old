import { requireRole } from '@/lib/supabase/server'

export default async function AdminLayout({ children }) {
  await requireRole(['admin'])
  return <>{children}</>
}
