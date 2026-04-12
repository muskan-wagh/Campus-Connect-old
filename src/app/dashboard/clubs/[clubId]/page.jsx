'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export default function ClubDetail() {
    const { clubId } = useParams()
    const router = useRouter()
    const supabase = createSupabaseClient()

    const [club, setClub] = useState(null)
    const [members, setMembers] = useState([])
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [isLead, setIsLead] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)

    // Image upload states
    const [uploadingCover, setUploadingCover] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)

    useEffect(() => {
        fetchClubData()
    }, [clubId])

    const fetchClubData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)

            // Fetch club details
            const { data: clubData, error: clubError } = await supabase
                .from('clubs')
                .select('*')
                .eq('id', clubId)
                .single()

            if (clubError) throw clubError
            setClub(clubData)

            // Fetch members
            const { data: membersData, error: membersError } = await supabase
                .from('club_members')
                .select(`
                    user_id,
                    role,
                    profiles (full_name, email, avatar_url, institute_name)
                `)
                .eq('club_id', clubId)

            if (membersError) throw membersError
            setMembers(membersData || [])

            // Check if current user is a lead
            const userIsLead = membersData?.some(m => m.user_id === user?.id && m.role === 'lead')
            setIsLead(userIsLead)

            // Fetch events
            const { data: eventsData, error: eventsError } = await supabase
                .from('events')
                .select('*')
                .eq('club_id', clubId)
                .eq('status', 'published')
                .order('event_date', { ascending: true })

            if (eventsError) throw eventsError
            setEvents(eventsData || [])

        } catch (err) {
            console.error('Error fetching club data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (file, type) => {
        if (!file || !isLead) return

        const setUploading = type === 'cover' ? setUploadingCover : setUploadingLogo
        setUploading(true)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${clubId}-${type}-${Date.now()}.${fileExt}`
            const filePath = `clubs/${fileName}`

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath)

            // Update club record
            const updateField = type === 'cover' ? 'cover_image' : 'logo_url'
            const { error: updateError } = await supabase
                .from('clubs')
                .update({ [updateField]: publicUrl })
                .eq('id', clubId)

            if (updateError) throw updateError

            await fetchClubData()
        } catch (err) {
            console.error('Error uploading image:', err)
            alert('Failed to upload image: ' + err.message)
        } finally {
            setUploading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-950 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Syncing Node...</p>
            </div>
        )
    }

    if (!club) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Node Not Found</h2>
                <Link href="/dashboard/clubs" className="text-slate-950 font-black uppercase tracking-widest text-[10px] hover:underline decoration-2 underline-offset-4">
                    ← Back to All Nodes
                </Link>
            </div>
        )
    }

    const leads = members.filter(m => m.role === 'lead')
    const regularMembers = members.filter(m => m.role === 'member')

    return (
        <div className="pb-12 text-slate-900">
            {/* Cover Image Section */}
            <div className="relative h-64 md:h-96 bg-slate-50 overflow-hidden rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-slate-200/50 group">
                {club.cover_image ? (
                    <img
                        src={club.cover_image}
                        alt={club.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                        <svg className="w-40 h-40 text-slate-200 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>

                {/* Upload Cover Button (Leads Only) */}
                {isLead && (
                    <label className="absolute top-8 right-8 px-6 py-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-950 hover:text-white transition-all shadow-2xl flex items-center gap-2 group/btn z-20">
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0], 'cover')}
                            disabled={uploadingCover}
                        />
                        {uploadingCover ? (
                            <>
                                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Change Layout
                            </>
                        )}
                    </label>
                )}

                {/* Back Button */}
                <Link
                    href="/dashboard/clubs"
                    className="absolute top-8 left-8 px-6 py-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-2xl flex items-center gap-2 group/back z-20"
                >
                    <svg className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Dashboard
                </Link>
            </div>

            {/* Club Info Section */}
            <div className="px-4 md:px-12 -mt-16 md:-mt-24 relative z-10">
                <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-slate-950/5 blur-3xl -mr-40 -mt-40 rounded-full"></div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 mb-10 md:mb-12 text-center md:text-left relative z-10">
                        {/* Logo */}
                        <div className="relative shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] bg-white border-[6px] border-white shadow-2xl overflow-hidden relative">
                                {club.logo_url ? (
                                    <img
                                        src={club.logo_url}
                                        alt={`${club.name} logo`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                                        <span className="text-5xl font-black text-slate-950">
                                            {club.name[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Upload Logo Button (Leads Only) */}
                            {isLead && (
                                <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-slate-950 transition-all shadow-2xl border-4 border-white group/logo">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e.target.files[0], 'logo')}
                                        disabled={uploadingLogo}
                                    />
                                    {uploadingLogo ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-5 h-5 text-white group-hover/logo:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </label>
                            )}
                        </div>

                        {/* Club Details */}
                        <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-6 gap-6">
                                <div className="flex flex-col items-center sm:items-start">
                                    <h1 className="text-3xl md:text-6xl font-black text-slate-900 mb-3 tracking-tighter leading-none uppercase">{club.name}</h1>
                                    <span className={`inline-block px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${club.is_approved
                                        ? 'bg-slate-50 text-slate-950 border border-slate-100'
                                        : 'bg-slate-50 text-slate-400 border border-slate-100'
                                        }`}>
                                        {club.is_approved ? '✓ Node Verified' : 'Awaiting Metadata Sync'}
                                    </span>
                                </div>

                                {isLead && (
                                    <Link
                                        href={`/dashboard/lead/members?club=${clubId}`}
                                        className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-950 transition-all shadow-xl shadow-slate-200 hover:shadow-slate-950/20 text-center active:scale-95"
                                    >
                                        Command Center
                                    </Link>
                                )}
                            </div>

                            <p className="text-slate-500 font-bold text-base md:text-lg leading-relaxed mb-8 md:mb-10 max-w-3xl opacity-80 md:line-clamp-none">
                                {club.description || 'This node is waiting for initial documentation protocol.'}
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 md:gap-12 border-t border-slate-50 pt-8 md:pt-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                                        <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">{members.length}</p>
                                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Agents</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">{events.length}</p>
                                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Broadcasts</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Members List */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Club Leads */}
                        <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-xl shadow-slate-100 border border-slate-50">
                            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 italic">
                                <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                System Admins
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {leads.map((member) => (
                                    <div key={member.user_id} className="flex items-center gap-5 p-6 bg-slate-50 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group/item">
                                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm overflow-hidden flex-shrink-0 border border-slate-100 group-hover/item:border-slate-200 transition-all group-hover/item:scale-105">
                                            {member.profiles?.avatar_url ? (
                                                <img
                                                    src={member.profiles.avatar_url}
                                                    alt={member.profiles.full_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-950 text-2xl font-black italic">
                                                    {member.profiles?.full_name?.[0]?.toUpperCase() || 'L'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-slate-900 truncate text-base group-hover/item:text-slate-950 transition-colors uppercase tracking-tight">{member.profiles?.full_name || 'Anonymous'}</p>
                                            <p className="text-[10px] text-slate-400 font-black truncate uppercase tracking-[0.2em]">{member.profiles?.email}</p>
                                            <span className="inline-block mt-3 px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-[0.3em] shadow-lg shadow-slate-200 group-hover/item:bg-slate-950 transition-colors">
                                                Controller
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Regular Members */}
                        {regularMembers.length > 0 && (
                            <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-100 border border-slate-50">
                                <h2 className="text-xl font-black text-slate-900 mb-8 italic">Verified Personnel ({regularMembers.length})</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {regularMembers.map((member) => (
                                        <div key={member.user_id} className="flex items-center gap-5 p-5 bg-white rounded-3xl hover:shadow-xl hover:shadow-slate-100 transition-all border border-slate-50 hover:border-slate-100 group/member">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 group-hover/member:scale-110 transition-transform">
                                                {member.profiles?.avatar_url ? (
                                                    <img
                                                        src={member.profiles.avatar_url}
                                                        alt={member.profiles.full_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl font-black italic">
                                                        {member.profiles?.full_name?.[0]?.toUpperCase() || 'M'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 truncate group-hover/member:text-slate-950 transition-colors uppercase tracking-tight">{member.profiles?.full_name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-slate-400 font-black truncate uppercase tracking-widest">{member.profiles?.institute_name || 'UNIV_SYNC'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Events */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-100 border border-slate-50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-950/5 blur-2xl rounded-full"></div>

                            <h2 className="text-xl font-black text-slate-900 mb-8 italic relative z-10">Queue Protocol</h2>
                            {events.length === 0 ? (
                                <div className="text-center py-12 relative z-10">
                                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Silence in Queue</p>
                                </div>
                            ) : (
                                <div className="space-y-6 relative z-10">
                                    {events.slice(0, 5).map((event) => (
                                        <Link href={`/dashboard/events/${event.id}`} key={event.id} className="block group/evt">
                                            <div className="p-6 bg-slate-50 rounded-3xl hover:bg-slate-950 transition-all group-hover/evt:translate-x-2">
                                                <h3 className="font-black text-slate-900 group-hover/evt:text-white mb-4 line-clamp-1 italic tracking-tight uppercase">{event.title}</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 text-[10px] text-slate-400 group-hover/evt:text-slate-50 font-black uppercase tracking-widest">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>{formatDate(event.event_date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] text-slate-400 group-hover/evt:text-slate-50 font-black uppercase tracking-widest">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span>{event.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <Link href="/dashboard/student/events" className="block w-full text-center mt-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-950 transition-all active:scale-95 shadow-lg shadow-slate-200">
                                Full Broadcast History
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
