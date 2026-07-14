'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default function EditProfilePage() {
  const [fullName, setFullName] = useState('')
  const [instituteName, setInstituteName] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [degree, setDegree] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        setFullName(profile.full_name || '')
        setInstituteName(profile.institute_name || '')
        setEducationLevel(profile.education_level || '')
        setDegree(profile.degree || '')
        setAcademicYear(profile.academic_year || '')
        setAvatarUrl(profile.avatar_url || '')
      }
    }
    loadProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let newAvatarUrl = avatarUrl

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}/avatar.${ext}`
        const { error: upErr } = await supabase.storage.from('profiles').upload(path, avatarFile, { upsert: true })
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path)
          newAvatarUrl = publicUrl
        }
      }

      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `${user.id}/cover.${ext}`
        await supabase.storage.from('profiles').upload(path, coverFile, { upsert: true })
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          institute_name: instituteName,
          education_level: educationLevel,
          degree,
          academic_year: academicYear,
          avatar_url: newAvatarUrl,
        })
        .eq('id', user.id)

      if (updateErr) throw updateErr

      setSuccess(true)
      setTimeout(() => router.push('/dashboard/profile'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <DashboardHeader title="Edit Profile" subtitle="Update your personal information" />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={avatarUrl} fallback={fullName?.[0]} size="lg" />
              <div>
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="hidden" id="avatar" />
                <label htmlFor="avatar" className="text-sm text-primary hover:underline cursor-pointer">Change avatar</label>
                <p className="text-xs text-muted-foreground">Upload a new profile picture</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eduLevel">Education level</Label>
                <Select id="eduLevel" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Bachelors">Bachelors</option>
                  <option value="Masters">Masters</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input id="degree" value={degree} onChange={(e) => setDegree(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Academic year</Label>
                <Input id="year" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institute">Institute</Label>
                <Input id="institute" value={instituteName} onChange={(e) => setInstituteName(e.target.value)} />
              </div>
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

            {success && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">Profile updated successfully!</div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
