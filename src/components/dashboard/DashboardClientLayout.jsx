'use client'
import Sidebar from './Sidebar'

export default function DashboardClientLayout({ user, profile, children }) {
    return (
        <div className="min-h-screen bg-background font-sans selection:bg-black selection:text-white relative">
            {/* Navigation (Sidebar Desktop / Bottom Nav Mobile) */}
            <Sidebar
                user={user}
                profile={profile}
            />

            {/* Main Content */}
            <main className="min-h-screen w-full lg:pl-72 pb-24 lg:pb-0 transition-all duration-300">
                {/* Content Area */}
                <div className="relative z-10 flex flex-col min-h-screen">
                    <div className="flex-grow w-full max-w-6xl mx-auto px-6 py-12 md:py-20">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
