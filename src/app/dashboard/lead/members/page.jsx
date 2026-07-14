'use client'

import { useState, useEffect, Suspense } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

function MembersContent() {
  const [clubs, setClubs] = useState([])
  const [selectedClub, setSelectedClub] = useState('')
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchClubs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('club_members')
        .select('clubs(id, name)')
        .eq('user_id', user.id)
        .eq('role', 'lead')

      const clubList = (data || []).map((m) => m.clubs).filter(Boolean)
      setClubs(clubList)
      if (clubList.length > 0) {
        setSelectedClub(clubList[0].id)
      }
    }
    fetchClubs()
  }, [])

  useEffect(() => {
    if (!selectedClub) return

    const fetchMembers = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('club_members')
        .select('*, profiles(id, full_name, email, avatar_url)')
        .eq('club_id', selectedClub)

      setMembers(data || [])
      setLoading(false)
    }
    fetchMembers()
  }, [selectedClub])

  const handleRoleChange = async (userId, newRole) => {
    await supabase
      .from('club_members')
      .update({ role: newRole })
      .eq('club_id', selectedClub)
      .eq('user_id', userId)

    setMembers(prev => prev.map(m =>
      m.user_id === userId ? { ...m, role: newRole } : m
    ))
  }

  const handleRemove = async (userId) => {
    await supabase
      .from('club_members')
      .delete()
      .eq('club_id', selectedClub)
      .eq('user_id', userId)

    setMembers(prev => prev.filter(m => m.user_id !== userId))
  }

  return (
    <div>
      <DashboardHeader title="Members" subtitle="Manage your club members" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)}>
              <option value="" disabled>Select a club</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>{club.name}</option>
              ))}
            </Select>
          </div>
          <Link href="/dashboard/lead/add-member">
            <Button variant="outline" size="sm">Add member</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">Loading members...</div>
        ) : members.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {members.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={member.profiles?.avatar_url}
                        fallback={member.profiles?.full_name?.[0]}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium">{member.profiles?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{member.profiles?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                        className="w-28"
                      >
                        <option value="member">Member</option>
                        <option value="lead">Lead</option>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(member.user_id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              {selectedClub ? 'No members found.' : 'Select a club to view members.'}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function MembersPage() {
  return (
    <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary mx-auto mt-20" />}>
      <MembersContent />
    </Suspense>
  )
}
