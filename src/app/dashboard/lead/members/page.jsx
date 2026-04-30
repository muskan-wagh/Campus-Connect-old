'use client'

import { useState, useEffect, Suspense } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/dashboard/Header'

function MembersForm() {
    const searchParams = useSearchParams()
    const clubIdParam = searchParams.get('club')

    const [myClubs, setMyClubs] = useState([])
    const [selectedClubId, setSelectedClubId] = useState(clubIdParam || '')
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [removingMember, setRemovingMember] = useState(null)

    const router = useRouter()
    const supabase = createSupabaseClient()

    useEffect(() => {
        const fetchMyClubs = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data, error } = await supabase
                    .from('club_members')
                    .select(`
                        club_id,
                        clubs (id, name)
                    `)
                    .eq('user_id', user.id)
                    .eq('role', 'lead')

                if (error) throw error

                const clubs = data?.map(item => item.clubs) || []
                setMyClubs(clubs)
                if (clubs.length > 0 && !selectedClubId) {
                    setSelectedClubId(clubs[0].id)
                }
            } catch (err) {
                console.error('Error fetching clubs:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchMyClubs()
    }, [])

    useEffect(() => {
        if (selectedClubId) {
            fetchMembers()
        }
    }, [selectedClubId])

    const fetchMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('club_members')
                .select(`
                    user_id,
                    role,
                    profiles (full_name, email, avatar_url)
                `)
                .eq('club_id', selectedClubId)

            if (error) throw error
            setMembers(data || [])
        } catch (err) {
            console.error('Error fetching members:', err)
        }
    }

    const handleRemoveMember = async (userId) => {
        if (!confirm('Are you sure you want to remove this member from the club?')) return

        setRemovingMember(userId)
        try {
            const { error } = await supabase
                .from('club_members')
                .delete()
                .eq('club_id', selectedClubId)
                .eq('user_id', userId)

            if (error) throw error

            await fetchMembers()
        } catch (err) {
            console.error('Error removing member:', err)
            alert('Failed to remove member: ' + err.message)
        } finally {
            setRemovingMember(null)
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        try {
            const { error } = await supabase
                .from('club_members')
                .update({ role: newRole })
                .eq('club_id', selectedClubId)
                .eq('user_id', userId)

            if (error) throw error

            await fetchMembers()
        } catch (err) {
            console.error('Error updating role:', err)
            alert('Failed to update role: ' + err.message)
        }
    }

    return (
        <div className="pb-12 text-foreground">
            <Header
                title="Member Management"
                subtitle="VIEW AND MANAGE YOUR CLUB ROSTER"
            />

            <div className="px-10">
                {loading ? (
                    <div className="flex flex-col items-center py-20">
                        <div className="w-12 h-12 border-2 border-border border-t-primary rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Synchronizing Roster...</p>
                    </div>
                ) : myClubs.length === 0 ? (
                    <div className="max-w-3xl mx-auto bg-card border border-border rounded-[3rem] p-20 text-center relative overflow-hidden shadow-xl shadow-primary/5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16"></div>
                        <div className="w-20 h-20 bg-muted border border-border rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <svg className="w-10 h-10 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-4 uppercase tracking-tighter italic">Sector Inactive</h3>
                        <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em] mb-10 max-w-sm mx-auto leading-relaxed">You must initialize at least one club frequency to manage member roster.</p>
                        <button onClick={() => router.push('/dashboard/lead/create-club')} className="px-10 py-5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20">Initialize Sector</button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="relative group">
                                <select
                                    className="bg-card border border-border rounded-2xl px-8 py-4 text-foreground font-black outline-none shadow-xl shadow-primary/5 appearance-none hover:border-primary transition-all cursor-pointer min-w-[300px] uppercase tracking-widest text-[10px]"
                                    value={selectedClubId}
                                    onChange={(e) => setSelectedClubId(e.target.value)}
                                >
                                    {myClubs.map(club => (
                                        <option key={club.id} value={club.id}>{club.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/dashboard/lead/add-member')}
                                className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Deploy New Member
                            </button>
                        </div>

                        <div className="bg-card rounded-[3rem] border border-border overflow-hidden shadow-2xl shadow-primary/5 relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20"></div>

                            {members.length === 0 ? (
                                <div className="p-32 text-center">
                                    <div className="w-16 h-16 bg-muted border border-border rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                                        <svg className="w-8 h-8 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </div>
                                    <h4 className="text-xl font-black text-foreground uppercase tracking-tighter italic mb-4">Roster Null</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-8">No synced nodes detected in this sector.</p>
                                    <button
                                        onClick={() => router.push('/dashboard/lead/add-member')}
                                        className="text-primary font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-colors border-b border-primary/20 pb-1"
                                    >
                                        Authorize First Node &rarr;
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50 border-b border-border">
                                            <tr>
                                                <th className="px-10 py-6 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Node Identity</th>
                                                <th className="px-10 py-6 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Frequency</th>
                                                <th className="px-10 py-6 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Classification</th>
                                                <th className="px-10 py-6 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {members.map((member) => (
                                                <tr key={member.user_id} className="hover:bg-muted transition-colors group">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-muted border-2 border-border group-hover:border-primary transition-all overflow-hidden relative">
                                                                <div className="w-full h-full rounded-xl bg-background flex items-center justify-center overflow-hidden">
                                                                    {member.profiles?.avatar_url ? (
                                                                        <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-primary font-black text-sm">
                                                                            {member.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="font-black text-foreground tracking-tighter uppercase group-hover:text-primary transition-colors">{member.profiles?.full_name || 'SYNC_ERROR'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <span className="text-muted-foreground text-[11px] font-bold font-mono tracking-tight group-hover:text-foreground transition-all">{member.profiles?.email || 'OFFLINE'}</span>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="relative inline-block w-40">
                                                            <select
                                                                value={member.role}
                                                                onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                                                                className="w-full bg-muted border border-border rounded-xl px-4 py-2 text-[10px] font-black text-foreground hover:border-primary outline-none transition-all appearance-none cursor-pointer uppercase tracking-widest"
                                                            >
                                                                <option value="member">MEM_ROLE</option>
                                                                <option value="lead">LEAD_ROLE</option>
                                                            </select>
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <button
                                                            onClick={() => handleRemoveMember(member.user_id)}
                                                            disabled={removingMember === member.user_id}
                                                            className="px-5 py-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-destructive/20 disabled:opacity-50"
                                                        >
                                                            {removingMember === member.user_id ? 'Pumping...' : 'Purge'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}

export default function Members() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Loading Roster...</p>
            </div>
        }>
            <MembersForm />
        </Suspense>
    )
}
