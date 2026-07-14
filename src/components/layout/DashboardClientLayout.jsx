'use client'

import DashboardSidebar from './DashboardSidebar'

export default function DashboardClientLayout({ user, profile, children }) {
  return (
    <div className="min-h-screen bg-background relative">
      <DashboardSidebar user={user} profile={profile} />
      <main className="min-h-screen w-full lg:pl-64 pb-24 lg:pb-0 transition-all duration-300">
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow w-full max-w-6xl mx-auto px-6 py-8 md:py-10">
            <div className="animate-fade-up">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
