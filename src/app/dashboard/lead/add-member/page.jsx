'use client'

import { useState, useEffect } from 'react'
import { useFormState } from '@/hooks/use-form-state'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default function AddMemberPage() {
  const [clubs, setClubs] = useState([])
  const [clubId, setClubId] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const { loading, error, success, handleSubmit } = useFormState()
  const router = useRouter()
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
      if (clubList.length > 0) setClubId(clubList[0].id)
    }
    fetchClubs()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    await handleSubmit(async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (!profile) throw new Error('No user found with this email')

      const { error: insertErr } = await supabase
        .from('club_members')
        .insert({
          club_id: clubId,
          user_id: profile.id,
          role,
          created_at: new Date().toISOString()
        })

      if (insertErr) {
        if (insertErr.code === '23505') throw new Error('User is already a member of this club')
        throw insertErr
      }

      setEmail('')
    })
  }

  return (
    <div className="max-w-lg mx-auto">
      <DashboardHeader title="Add Member" subtitle="Add a new member to your club" />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="club">Club</Label>
              <Select id="club" value={clubId} onChange={(e) => setClubId(e.target.value)} required>
                <option value="" disabled>Select a club</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Student email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@institute.edu" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="lead">Co-Lead</option>
              </Select>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            {success && <Alert variant="success">Member added successfully!</Alert>}

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Adding member...' : 'Add member'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
