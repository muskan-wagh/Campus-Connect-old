import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

function getRoleFromUser(user) {
  const raw = (user?.user_metadata?.role || 'student').toLowerCase().trim()
  if (raw === 'lead' || raw === 'club_lead') return 'lead'
  return raw
}

const rolePaths = ['admin', 'lead', 'student']

export async function middleware(req) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        return res
    }

    const supabase = createServerClient(
        url,
        key,
        {
            cookies: {
                get(name) {
                    return req.cookies.get(name)?.value
                },
                set(name, value, options) {
                    req.cookies.set({ name, value, ...options })
                    res = NextResponse.next({
                        request: { headers: req.headers },
                    })
                    res.cookies.set({ name, value, ...options })
                },
                remove(name, options) {
                    req.cookies.set({ name, value: '', ...options })
                    res = NextResponse.next({
                        request: { headers: req.headers },
                    })
                    res.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const pathname = req.nextUrl.pathname
    const isDashboard = pathname.startsWith('/dashboard')
    const isAuth = pathname.startsWith('/auth')

    // Unauthenticated → login
    if (isDashboard && !user) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Authenticated on auth pages → dashboard
    if (isAuth && user && !req.nextUrl.searchParams.has('message')) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (!user) return res

    const role = getRoleFromUser(user)

    // /dashboard → /dashboard/{role}
    if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url))
    }

    // Cross-role access blocking
    for (const rp of rolePaths) {
        if (pathname === `/dashboard/${rp}` || pathname.startsWith(`/dashboard/${rp}/`)) {
            if (role !== rp) {
                return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url))
            }
        }
    }

    return res
}

export const config = {
    matcher: ['/dashboard/:path*', '/dashboard', '/auth/:path*'],
}
