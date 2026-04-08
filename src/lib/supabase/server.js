import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

export const createSupabaseAnon = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) return null

    return createClient(url, key)
}

export const createSupabaseServer = cache(async () => {
    const cookieStore = await cookies()

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        console.warn('Supabase credentials missing. Server client will not be initialized.')
        return null
    }

    return createServerClient(
        url,
        key,
        {
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.value
                },
                set(name, value, options) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                    }
                },
                remove(name, options) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // The `remove` method was called from a Server Component.
                    }
                },
            },
        }
    )
})

import { redirect } from 'next/navigation'

export const getUserProfile = cache(async () => {
    const supabase = await createSupabaseServer()
    if (!supabase) return { user: null, profile: null }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { user: null, profile: null }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return { user, profile }
})

export async function requireRole(allowedRoles) {
    const { user, profile } = await getUserProfile()

    if (!user) {
        redirect('/auth/login')
    }

    const rawRole = profile?.role || user.user_metadata?.role || 'student'
    const role = rawRole.toLowerCase().trim()

    // Normalize roles for comparison
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim())

    // Treat 'lead' and 'club_lead' as equivalent for authorization checks
    const hasAccess = normalizedAllowedRoles.some(allowed => {
        if (allowed === 'club_lead' || allowed === 'lead') {
            return role === 'club_lead' || role === 'lead'
        }
        return role === allowed
    })

    if (!hasAccess) {
        redirect('/dashboard')
    }

    return { user, profile, role }
}
