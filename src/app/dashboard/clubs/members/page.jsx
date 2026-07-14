'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default function ClubMembersPage() {
  const [clubs, setClubs] = useState([])
  const [selectedClub, setSelectedClub] = useState('')
  const [members, setMembers] = useState([])
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchClubs = async () => {
      const { data } = await supabase.from('clubs').select('id, name').eq('is_approved', true)
      setClubs(data || [])
    }
    fetchClubs()
  }, [])

  useEffect(() => {
    if (!selectedClub) return

    const fetchMembers = async () => {
      const { data } = await supabase
        .from('club_members')
        .select('*, profiles(full_name, email, avatar_url)')
        .eq('club_id', selectedClub)
      setMembers(data || [])
    }
    fetchMembers()
  }, [selectedClub])

  const leads = members.filter((m) => m.role === 'lead')
  const regulars = members.filter((m) => m.role === 'member')

  return (
    <div>
      <DashboardHeader title="Club Members" subtitle="View members across clubs" />

      <div className="mb-6 w-64">
        <Select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)}>
          <option value="" disabled>Select a club</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>{club.name}</option>
          ))}
        </Select>
      </div>

      {selectedClub ? (
        <div className="space-y-6">
          {leads.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Leadership</h3>
              <div className="space-y-2">
                {leads.map((lead) => (
                  <Card key={lead.user_id}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar src={lead.profiles?.avatar_url} fallback={lead.profiles?.full_name?.[0]} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lead.profiles?.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{lead.profiles?.email}</p>
                      </div>
                      <Badge variant="secondary">Lead</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {regulars.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Members ({regulars.length})</h3>
              <div className="space-y-2">
                {regulars.map((member) => (
                  <Card key={member.user_id}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar src={member.profiles?.avatar_url} fallback={member.profiles?.full_name?.[0]} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.profiles?.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.profiles?.email}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {members.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">No members found.</CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">Select a club to view its members.</CardContent>
        </Card>
      )}
    </div>
  )
}
