import { getUserProfile } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClientLayout from '@/components/layout/DashboardClientLayout'

export default async function DashboardLayout({ children }) {
  const { user, profile } = await getUserProfile()

  if (!user) {
    redirect('/auth/login')
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full rounded-xl border bg-card p-8 text-center">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-6">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold mb-2">Profile not found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your profile could not be loaded. Please try signing in again.
          </p>
          <div className="flex flex-col gap-3">
            <form action="/auth/login" method="get">
              <button type="submit" className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
                Sign in again
              </button>
            </form>
            <form action="/api/auth/sign-out" method="post">
              <button type="submit" className="w-full h-10 rounded-lg border border-input bg-background text-sm font-medium hover:bg-accent transition-all">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardClientLayout user={user} profile={profile}>
      {children}
    </DashboardClientLayout>
  )
}
