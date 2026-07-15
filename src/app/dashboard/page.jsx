'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function DashboardRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    async function redirect() {
      const supabase = createSupabaseClient()
      if (!supabase) { router.replace('/auth/login'); return }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/auth/login')
        return
      }

      const role = (session.user.user_metadata?.role || 'student').toLowerCase().trim()
      const normalized = (role === 'lead' || role === 'club_lead') ? 'lead' : role
      router.replace(`/dashboard/${normalized}`)
    }
    redirect()
  }, [router])

  return null
}
