'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('student')
  const [instituteName, setInstituteName] = useState('')
  const [educationLevel, setEducationLevel] = useState('Bachelors')
  const [degree, setDegree] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role, institute_name: instituteName, education_level: educationLevel, degree, academic_year: academicYear }
        }
      })

      if (signUpError) throw signUpError

      if (user) {
        let avatarUrl = ''
        if (avatarFile) {
          const fileExt = avatarFile.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `${user.id}/${fileName}`
          const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, avatarFile)
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath)
            avatarUrl = publicUrl
          }
        }

        const profileData = {
          id: user.id,
          full_name: fullName,
          email,
          role,
          institute_name: instituteName,
          education_level: educationLevel,
          degree,
          academic_year: academicYear,
          avatar_url: avatarUrl,
          created_at: new Date().toISOString(),
        }

        try {
          const { error: profileError } = await supabase.from('profiles').upsert(profileData)
          if (profileError && !profileError.message.includes('row-level security')) {
            throw profileError
          }
        } catch (pErr) {
          console.warn('Profile sync handled by database trigger or blocked by RLS:', pErr)
        }

        router.push('/auth/login?message=Account created successfully! Please sign in.')
        return
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.015] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background text-sm font-bold">CC</span>
            </div>
            <span className="text-base font-semibold tracking-tight">
              Campus<span className="text-muted-foreground">Connect</span>
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Join your campus community</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eduLevel">Education level</Label>
                    <Select id="eduLevel" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                      <option value="Bachelors">Bachelors</option>
                      <option value="Masters">Masters</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree</Label>
                    <Input id="degree" placeholder="e.g. CS" value={degree} onChange={(e) => setDegree(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Academic year</Label>
                    <Input id="year" placeholder="e.g. 3rd" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institute">Institute</Label>
                    <Input id="institute" placeholder="University name" value={instituteName} onChange={(e) => setInstituteName(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="hidden" id="avatar-reg" />
                  <label htmlFor="avatar-reg" className="flex items-center gap-3 h-10 rounded-xl border border-input bg-background px-3 text-sm text-muted-foreground hover:bg-accent transition-all cursor-pointer">
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{avatarFile ? avatarFile.name : 'Upload avatar'}</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" placeholder="you@institute.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Input id="reg-password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="club_lead">Club Lead</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>

                {error && (
                  <div className="rounded-xl bg-destructive/5 border border-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" loading={loading} className="w-full">
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full flex items-center justify-center gap-3 h-10 rounded-xl border border-input bg-background text-sm font-medium hover:bg-accent transition-all active:scale-[0.97]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                </svg>
                Google
              </button>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
