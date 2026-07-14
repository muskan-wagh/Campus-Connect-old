'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function CreateClubPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let logoUrl = ''
      let coverUrl = ''

      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-logo.${ext}`
        const { error: upErr } = await supabase.storage.from('clubs').upload(path, logoFile)
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from('clubs').getPublicUrl(path)
          logoUrl = publicUrl
        }
      }

      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-cover.${ext}`
        const { error: upErr } = await supabase.storage.from('clubs').upload(path, coverFile)
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from('clubs').getPublicUrl(path)
          coverUrl = publicUrl
        }
      }

      const { data: club, error: clubErr } = await supabase
        .from('clubs')
        .insert({
          name,
          description,
          logo_url: logoUrl,
          cover_image: coverUrl,
          is_approved: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (clubErr) throw clubErr

      const { error: memberErr } = await supabase
        .from('club_members')
        .insert({
          club_id: club.id,
          user_id: user.id,
          role: 'lead',
          created_at: new Date().toISOString()
        })

      if (memberErr) throw memberErr

      setSuccess(true)
      setTimeout(() => router.push('/dashboard/lead'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2">Club created!</h2>
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create a Club</h1>
        <p className="text-sm text-muted-foreground mt-1">Register a new club on the platform.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Club name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter club name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your club" rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="hidden" id="logo" />
              <label htmlFor="logo" className="flex items-center gap-3 h-10 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground hover:bg-accent transition-all cursor-pointer">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="truncate">{logoFile ? logoFile.name : 'Upload club logo'}</span>
              </label>
            </div>

            <div className="space-y-2">
              <Label>Cover image</Label>
              <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="hidden" id="cover" />
              <label htmlFor="cover" className="flex items-center gap-3 h-10 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground hover:bg-accent transition-all cursor-pointer">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="truncate">{coverFile ? coverFile.name : 'Upload cover image'}</span>
              </label>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Creating club...' : 'Create club'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
