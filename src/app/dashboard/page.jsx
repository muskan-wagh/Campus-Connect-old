import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Attempt to fetch profile
    let { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // Fallback to metadata if DB record hasn't synced yet
    const rawRole = profile?.role || user.user_metadata?.role || 'student'
    const userRole = rawRole.toLowerCase().trim()

    switch (userRole) {
        case 'admin':
            return redirect('/dashboard/admin')
        case 'club_lead':
        case 'lead':
            return redirect('/dashboard/lead')
        case 'student':
        default:
            return redirect('/dashboard/student')
    }
}
