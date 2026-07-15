'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default function ClubManageMembersPage() {
  const { clubId } = useParams()
  const [members, setMembers] = useState([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('club_members')
        .select('*, profiles(id, full_name, email, avatar_url)')
        .eq('club_id', clubId)
      setMembers(data || [])
    }
    fetchMembers()
  }, [clubId])

  const addMember = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (!profile) throw new Error('User not found')

      const { error: insertErr } = await supabase
        .from('club_members')
        .insert({ club_id: clubId, user_id: profile.id, role: 'member', created_at: new Date().toISOString() })

      if (insertErr) {
        if (insertErr.code === '23505') throw new Error('Already a member')
        throw insertErr
      }

      setSuccess(true)
      setEmail('')
      const { data } = await supabase
        .from('club_members')
        .select('*, profiles(id, full_name, email, avatar_url)')
        .eq('club_id', clubId)
      setMembers(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const removeMember = async (userId) => {
    await supabase.from('club_members').delete().eq('club_id', clubId).eq('user_id', userId)
    setMembers(prev => prev.filter(m => m.user_id !== userId))
  }

  return (
    <div className="max-w-lg mx-auto">
      <DashboardHeader title="Manage Members" subtitle="Add or remove club members" />

      <div className="flex items-center gap-3 mb-6">
        <Input
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button onClick={addMember} loading={loading} size="sm">Add</Button>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">Member added!</Alert>}

      <div className="space-y-2">
        {members.map((member) => (
          <Card key={member.user_id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={member.profiles?.avatar_url} fallback={member.profiles?.full_name?.[0]} size="sm" />
                <div>
                  <p className="text-sm font-medium">{member.profiles?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{member.profiles?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">{member.role}</Badge>
                {member.role !== 'lead' && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeMember(member.user_id)}>
                    Remove
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {members.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">No members yet.</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
