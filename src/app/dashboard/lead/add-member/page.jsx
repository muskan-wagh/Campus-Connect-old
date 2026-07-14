'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default function AddMemberPage() {
  const [clubs, setClubs] = useState([])
  const [clubId, setClubId] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
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

      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <DashboardHeader title="Add Member" subtitle="Add a new member to your club" />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {error && (
              <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            {success && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">Member added successfully!</div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Adding member...' : 'Add member'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
