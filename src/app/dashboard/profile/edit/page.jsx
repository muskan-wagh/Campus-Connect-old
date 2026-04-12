'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'

export default function EditProfilePage() {
    const [profile, setProfile] = useState(null)
    const [fullName, setFullName] = useState('')
    const [instituteName, setInstituteName] = useState('')
    const [educationLevel, setEducationLevel] = useState('')
    const [degree, setDegree] = useState('')
    const [academicYear, setAcademicYear] = useState('')
    const [avatarFile, setAvatarFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [coverFile, setCoverFile] = useState(null)
    const [coverPreviewUrl, setCoverPreviewUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const supabase = createSupabaseClient()
    const router = useRouter()

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error

            setProfile(data)
            setFullName(data.full_name || '')
            setInstituteName(data.institute_name || '')
            setEducationLevel(data.education_level || 'Bachelors')
            setDegree(data.degree || '')
            setAcademicYear(data.academic_year || '')
            setPreviewUrl(data.avatar_url || '')
            setCoverPreviewUrl(data.cover_image || '')
        } catch (err) {
            console.error('Error fetching profile:', err)
            setError('Could not load profile data.')
        } finally {
            setFetching(false)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAvatarFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleCoverChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setCoverFile(file)
            setCoverPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            let avatarUrl = profile.avatar_url
            let coverUrl = profile.cover_image

            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${user.id}/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('profiles')
                    .upload(filePath, avatarFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('profiles')
                    .getPublicUrl(filePath)

                avatarUrl = publicUrl
            }

            if (coverFile) {
                const fileExt = coverFile.name.split('.').pop()
                const fileName = `cover-${Math.random()}.${fileExt}`
                const filePath = `${user.id}/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('profiles')
                    .upload(filePath, coverFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('profiles')
                    .getPublicUrl(filePath)

                coverUrl = publicUrl
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    institute_name: instituteName,
                    education_level: educationLevel,
                    degree: degree,
                    academic_year: academicYear,
                    avatar_url: avatarUrl,
                    cover_image: coverUrl
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            setSuccess(true)
            setTimeout(() => router.push('/dashboard/profile'), 1500)
        } catch (err) {
            console.error('Update error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="pb-12 text-slate-900">
            <Header
                title="Edit Identity"
                subtitle="MODIFY CORE NODE PARAMETERS"
            />

            <div className="max-w-2xl mx-auto mt-10">
                <form onSubmit={handleUpdate} className="space-y-8 bg-white border border-slate-100 rounded-[3.5rem] p-12 overflow-hidden shadow-2xl shadow-slate-200/50 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-950/5 blur-3xl -mr-16 -mt-16"></div>
                    {/* Cover Upload */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Profile Cover Graphic</label>
                        <div className="relative h-48 w-full rounded-[2.5rem] overflow-hidden bg-slate-50 border-2 border-slate-100 transition-all group-hover:border-slate-300">
                            {coverPreviewUrl ? (
                                <img src={coverPreviewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200/20 to-transparent"></div>
                                </div>
                            )}
                            <label htmlFor="cover-upload" className="absolute bottom-4 right-4 px-6 py-3 bg-white text-slate-950 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-slate-950 hover:text-white transition-all shadow-2xl text-[9px] font-black uppercase tracking-widest z-20">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Change Layout
                                <input type="file" id="cover-upload" className="hidden" accept="image/*" onChange={handleCoverChange} />
                            </label>
                        </div>
                    </div>

                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group -mt-16">
                            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-white p-1 border-4 border-white shadow-2xl relative group">
                                <div className="w-full h-full rounded-[2rem] overflow-hidden bg-slate-50 flex items-center justify-center">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-200 font-serif italic">
                                            {fullName?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center cursor-pointer hover:bg-slate-950 transition-all shadow-xl z-20 border-4 border-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Update Portrait Graphic</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Identity</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-slate-300 transition-all ring-0"
                                placeholder="Enter full name"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Institute Node</label>
                            <input
                                type="text"
                                value={instituteName}
                                onChange={(e) => setInstituteName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-slate-300 transition-all ring-0"
                                placeholder="Institute Name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Degree Level</label>
                            <div className="relative">
                                <select
                                    value={educationLevel}
                                    onChange={(e) => setEducationLevel(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-slate-300 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Bachelors">Undergraduate / Bachelors</option>
                                    <option value="Masters">Postgraduate / Masters</option>
                                    <option value="PhD">Doctorate / PhD</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Degree Program</label>
                            <input
                                type="text"
                                value={degree}
                                onChange={(e) => setDegree(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-slate-300 transition-all ring-0"
                                placeholder="e.g. Computer Science"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Academic Cycle</label>
                        <input
                            type="text"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-slate-300 transition-all ring-0"
                            placeholder="e.g. 3rd Year"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold tracking-widest uppercase italic">
                            Error: {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-xs font-bold tracking-widest uppercase italic">
                            Identity updated successfully. Redirecting...
                        </div>
                    )}

                    <div className="flex gap-4 pt-10">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-8 py-5 bg-white text-slate-400 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:text-slate-900 transition-all border border-slate-100"
                        >
                            Abort Sync
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] px-8 py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-950 transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
                        >
                            {loading ? 'SYNCHRONIZING...' : 'Commit Core Parameters'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
