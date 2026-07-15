'use client'

import { DashboardProvider } from '@/lib/dashboard-context'
import DashboardNavbar from './DashboardNavbar'

export default function DashboardClientLayout({ user, profile, children }) {
  return (
    <DashboardProvider user={user} profile={profile}>
      <div className="min-h-screen bg-background">
        <DashboardNavbar user={user} profile={profile} />
        <main className="pt-16 min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-fade-up">
              {children}
            </div>
          </div>
        </main>
      </div>
    </DashboardProvider>
  )
}
