'use client'

import { useState } from 'react'
import { useFormState } from '@/hooks/use-form-state'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default function NewClubPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { loading, error, success, handleSubmit } = useFormState()
  const router = useRouter()
  const supabase = createSupabaseClient()

  const onSubmit = async (e) => {
    e.preventDefault()
    await handleSubmit(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: club, error: clubErr } = await supabase
        .from('clubs')
        .insert({ name, description, is_approved: false, created_at: new Date().toISOString() })
        .select()
        .single()

      if (clubErr) throw clubErr

      const { error: memberErr } = await supabase
        .from('club_members')
        .insert({ club_id: club.id, user_id: user.id, role: 'lead', created_at: new Date().toISOString() })

      if (memberErr) throw memberErr

      setTimeout(() => router.push(`/dashboard/clubs/${club.id}`), 2000)
    })
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2">Club registered!</h2>
        <p className="text-sm text-muted-foreground">It will be visible after admin approval.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <DashboardHeader title="Register Club" subtitle="Create a new club on the platform" />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Club name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter club name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your club" rows={4} />
            </div>
            {error && <Alert variant="error">{error}</Alert>}
            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Registering...' : 'Register club'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
