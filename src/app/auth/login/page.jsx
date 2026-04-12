'use client'

import { useState, Suspense } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const router = useRouter()
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    const supabase = createSupabaseClient()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            router.push('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSocialLogin = async (provider) => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
                }
            })
            if (error) throw error
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-slate-900 selection:text-white">
            {/* Left Side: Visual/Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-50 border-r border-slate-100 relative items-center justify-center p-20 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-slate-900/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-slate-900/5 rounded-full blur-[120px]"></div>

                {/* Decorative Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                <div className="relative z-10 text-slate-900 max-w-lg">
                    <Link href="/" className="inline-block mb-16 group">
                        <Logo className="text-slate-900 w-auto h-14 group-hover:scale-110 transition-transform duration-500" showText={true} />
                    </Link>
                    <h2 className="text-6xl font-serif mb-10 tracking-tighter leading-[0.95] text-slate-900">
                        Access the <br />
                        <span className="text-slate-950 underline decoration-slate-200 decoration-4">Campus Hub.</span>
                    </h2>
                    <p className="text-xl text-slate-500 leading-relaxed font-light max-w-md opacity-80 italic">
                        Log in to coordinate events, manage your clubs, and stay connected with your campus community in real-time.
                    </p>

                    <div className="mt-20 flex items-center gap-8 p-6 bg-white/50 border border-white shadow-xl shadow-slate-200/50">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-12 h-12 border-2 border-white bg-slate-50 overflow-hidden shadow-sm grayscale hover:grayscale-0 transition-all">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="user" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-900">Node Sync Active</p>
                            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400">Verified by 1.2k+ Agents</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-12 relative overflow-y-auto bg-white">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-14">
                        <div className="lg:hidden mb-12">
                            <Link href="/">
                                <Logo className="text-slate-900 w-auto h-12" showText={false} />
                            </Link>
                        </div>
                        <h1 className="text-4xl font-serif text-slate-900 mb-4 tracking-tighter">AUTHENTICATE.</h1>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-px bg-slate-900 uppercase"></div>
                            <p className="text-slate-400 font-medium text-[10px] uppercase tracking-[0.4em]">Initialize Connection</p>
                        </div>
                    </div>

                    {message && (
                        <div className="mb-10 border border-slate-900 bg-slate-950 text-white px-6 py-5 text-[10px] font-bold text-center tracking-widest uppercase shadow-2xl">
                            {message.includes('successful') ? 'SUCCESSFULLY AUTHENTICATED. YOU CAN NOW SIGN IN.' : `SYSTEM_MSG: ${message.toUpperCase()}`}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] pl-1">Identifier (Email)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-slate-950 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-100 pl-16 pr-6 py-5 text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-bold outline-none placeholder:text-slate-200 text-sm tracking-tight"
                                    placeholder="agent@institute.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Credentials</label>
                                <button type="button" className="text-[9px] font-bold text-slate-300 hover:text-slate-950 uppercase tracking-widest transition-colors decoration-1 underline-offset-4 hover:underline">Lost Protocol?</button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-slate-950 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-100 pl-16 pr-16 py-5 text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-bold outline-none placeholder:text-slate-200 text-sm tracking-tight"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-6 flex items-center text-slate-300 hover:text-slate-950 focus:outline-none transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-5 text-[10px] font-bold tracking-[0.2em] shadow-sm animate-pulse">
                                SYSTEM_ERROR: {error.toUpperCase()}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-950 text-white font-bold py-6 transition-all transform hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-slate-200"
                        >
                            {loading ? "ESTABLISHING LINK..." : "INITIATE ACCESS"}
                        </button>
                    </form>

                    <div className="mt-20">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-50"></div></div>
                            <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-[0.4em]">
                                <span className="bg-white px-8 text-slate-300">Alternate Sync</span>
                            </div>
                        </div>

                        <div className="mt-12">
                            <button
                                type="button"
                                onClick={() => handleSocialLogin('google')}
                                className="w-full flex justify-center items-center h-16 border border-slate-100 hover:border-slate-900 hover:bg-slate-50 transition-all group gap-5 shadow-sm active:scale-95"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                                </svg>
                                <span className="text-[10px] font-bold text-slate-900 group-hover:text-slate-950 uppercase tracking-[0.3em]">Continue with Google</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-16 text-center text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">
                        New Node? <Link href="/auth/register" className="text-slate-950 hover:underline underline-offset-8 transition-all decoration-1">Create Global Profile</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="w-16 h-16 border border-slate-100 border-t-slate-950 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] animate-pulse">Initializing Security Protocol...</p>
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
