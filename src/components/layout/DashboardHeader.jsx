'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { NotificationDropdown } from './NotificationDropdown'

export function DashboardHeader({ title, subtitle }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await createSupabaseClient()?.auth.getUser() || {}
      setUser(user)
    }
    fetchUser()
  }, [])

  return (
    <div className="flex flex-col gap-1 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user && <NotificationDropdown user={user} />}
        </div>
      </div>
    </div>
  )
}
