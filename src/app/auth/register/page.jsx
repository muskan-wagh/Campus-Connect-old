'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState('student')
    const [instituteName, setInstituteName] = useState('')
    const [educationLevel, setEducationLevel] = useState('Bachelors')
    const [degree, setDegree] = useState('')
    const [academicYear, setAcademicYear] = useState('')
    const [avatarFile, setAvatarFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const supabase = createSupabaseClient()

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user }, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                        institute_name: instituteName,
                        education_level: educationLevel,
                        degree: degree,
                        academic_year: academicYear,
                    }
                }
            })

            if (signUpError) throw signUpError

            if (user) {
                let avatarUrl = ''
                if (avatarFile) {
                    const fileExt = avatarFile.name.split('.').pop()
                    const fileName = `${Math.random()}.${fileExt}`
                    const filePath = `${user.id}/${fileName}`
                    const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, avatarFile)
                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath)
                        avatarUrl = publicUrl
                    } else {
                        console.error('Avatar upload error:', uploadError)
                    }
                }

                const profileData = {
                    id: user.id,
                    full_name: fullName,
                    email: email,
                    role: role,
                    institute_name: instituteName,
                    education_level: educationLevel,
                    degree: degree,
                    academic_year: academicYear,
                    avatar_url: avatarUrl,
                    created_at: new Date().toISOString(),
                }

                try {
                    const { error: profileError } = await supabase.from('profiles').upsert(profileData)
                    if (profileError && !profileError.message.includes('row-level security')) {
                        throw profileError
                    }
                } catch (pErr) {
                    console.warn('Profile sync handled by database trigger or blocked by RLS:', pErr)
                }

                // Updated success message for the redirect
                router.push('/auth/login?message=Authenticated successfully! You can now sign in to access your dashboard.')
                return;
            }
        } catch (err) {
            console.error('Registration failed:', err)
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
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-900/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-slate-900/5 rounded-full blur-[120px]"></div>

                {/* Decorative Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                <div className="relative z-10 text-slate-900 max-w-lg">
                    <Link href="/" className="inline-block mb-16 group">
                        <Logo className="text-slate-900 w-auto h-14 group-hover:scale-110 transition-transform duration-500" showText={true} />
                    </Link>
                    <h2 className="text-6xl font-serif mb-10 tracking-tighter leading-[0.95] text-slate-900">
                        Join the <br />
                        <span className="text-slate-950 underline decoration-slate-200 decoration-4">Movement.</span>
                    </h2>
                    <p className="text-xl text-slate-500 leading-relaxed font-light max-w-md opacity-80 italic">
                        Create your account to start leading clubs, organizing events, and connecting with students across your campus.
                    </p>

                    <div className="mt-20 bg-white/50 border border-white p-10 shadow-xl shadow-slate-200/50">
                        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-900 mb-4">Fast Access Protocol</p>
                        <p className="text-lg font-serif italic text-slate-500 leading-snug font-light">
                            "The easiest way to <span className="text-slate-950 not-italic font-bold underline decoration-slate-100 uppercase text-sm tracking-widest">broadcast your events</span> to the entire student body."
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Form Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-12 relative overflow-y-auto bg-white">
                <div className="max-w-md w-full mx-auto py-12">
                    <div className="mb-14">
                        <div className="lg:hidden mb-12">
                            <Link href="/">
                                <Logo className="text-slate-900 w-auto h-12" showText={false} />
                            </Link>
                        </div>
                        <h1 className="text-4xl font-serif text-slate-900 mb-4 tracking-tighter uppercase">Initialize Node.</h1>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-px bg-slate-900"></div>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Register Global Profile</p>
                        </div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-8">
                        {/* Name Input */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] pl-1">Full Identity Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-50/50 border border-slate-100 px-6 py-5 text-slate-900 focus:bg-white focus:border-slate-950 transition-all font-bold outline-none placeholder:text-slate-200 text-sm tracking-tight shadow-inner"
                                placeholder="Enter full name..."
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        {/* Edu + Degree */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] pl-1">Edu Level</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-50/50 border border-slate-100 px-6 py-5 text-slate-900 focus:bg-white focus:border-slate-950 transition-all font-bold outline-none cursor-pointer appearance-none text-sm shadow-inner"
                                        value={educationLevel}
                                        onChange={(e) => setEducationLevel(e.target.value)}
                                    >
                                        <option value="Bachelors">Bachelors</option>
                                        <option value="Masters">Masters</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] pl-1">Degree Node</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-100 px-6 py-5 text-slate-900 focus:bg-white focus:border-slate-950 transition-all font-bold outline-none placeholder:text-slate-200 text-sm tracking-tight shadow-inner"
                                    placeholder="e.g. CS"
                                    value={degree}
                                    onChange={(e) => setDegree(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Year + Institute */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] pl-1">Academic Year</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-100 px-6 py-5 text-slate-900 focus:bg-white focus:border-slate-950 transition-all font-bold outline-none placeholder:text-slate-200 text-sm tracking-tight shadow-inner"
                                    placeholder="e.g. 3rd"
                                    value={academicYear}
                                    onChange={(e) => setAcademicYear(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] pl-1">Institute</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-100 px-6 py-5 text-slate-900 focus:bg-white focus:border-slate-950 transition-all font-bold outline-none placeholder:text-slate-200 text-sm tracking-tight shadow-inner"
                                    placeholder="Uni name..."
                                    value={instituteName}
                                    onChange={(e) => setInstituteName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] pl-1">Identity Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setAvatarFile(e.target.files[0])}
                                className="hidden"
                                id="avatar-reg"
                            />
                            <label
                                htmlFor="avatar-reg"
                                className="w-full flex items-center bg-slate-50/30 border border-slate-100 rounded-sm px-6 py-5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-900 transition-all cursor-pointer font-bold shadow-sm"
                            >
                                <svg className="w-6 h-6 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate text-[10px] tracking-[0.2em] uppercase">{avatarFile ? avatarFile.name : 'Upload Profile Graphic'}</span>
                            </label>
                        </div>

                        {/* Email */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] pl-1">Email Coordinates</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-slate-50/50 border border-slate-100 px-6 py-5 text-slate-900 focus:bg-white focus:border-slate-950 transition-all font-bold outline-none placeholder:text-slate-200 text-sm tracking-tight shadow-inner"
                                placeholder="agent@institute.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-3 relative group">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] pl-1">Security Protocol (Password)</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-slate-50/50 border border-slate-100 px-6 py-5 text-slate-900 focus:bg-white focus:border-slate-950 transition-all font-bold outline-none shadow-inner"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute bottom-5 right-6 text-slate-300 hover:text-slate-950 transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>

                        {/* Role Select */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] pl-1">Assign Protocol (Role)</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-50/50 border border-slate-100 px-6 py-5 text-slate-900 focus:bg-white focus:border-slate-950 transition-all font-bold outline-none cursor-pointer appearance-none text-sm shadow-inner"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="student">Student Node</option>
                                    <option value="club_lead">Club Leadership</option>
                                    <option value="admin">System Moderator</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-5 text-[10px] font-bold tracking-[0.2em] shadow-sm animate-pulse">
                                PROTOCOL_ERROR: {error.toUpperCase()}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-950 text-white font-bold py-6 transition-all transform hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-slate-200"
                        >
                            {loading ? "ESTABLISHING HANDSHAKE..." : "SYNCHRONIZE PROFILE"}
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
                                className="w-full flex justify-center items-center h-16 border border-slate-100 hover:border-slate-950 hover:bg-slate-50 transition-all group gap-5 shadow-sm active:scale-95"
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
                        Existing Node? <Link href="/auth/login" className="text-slate-950 hover:underline underline-offset-8 transition-all decoration-1">Authenticate Access</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
