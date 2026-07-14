'use client'

import { NotificationDropdown } from './NotificationDropdown'

export function DashboardHeader({ title, subtitle, user }) {
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
          <NotificationDropdown user={user} />
        </div>
      </div>
    </div>
  )
}
