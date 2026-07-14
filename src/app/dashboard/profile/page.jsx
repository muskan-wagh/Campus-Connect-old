import { createSupabaseServer, getUserProfile } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default async function ProfilePage() {
  const { user, profile } = await getUserProfile()

  return (
    <div className="max-w-2xl mx-auto">
      <DashboardHeader title="Profile" subtitle="Your account details" />

      <div className="space-y-6">
        <Card>
          <div className="h-32 rounded-t-xl bg-muted" />
          <CardContent className="p-6 -mt-16 relative">
            <div className="flex items-end gap-4 mb-6">
              <Avatar src={profile?.avatar_url} fallback={profile?.full_name?.[0]} size="xl" className="ring-4 ring-background" />
              <div className="pb-1">
                <h2 className="text-xl font-semibold">{profile?.full_name || 'User'}</h2>
                <Badge variant="secondary" className="capitalize mt-1">{profile?.role || 'student'}</Badge>
              </div>
            </div>

            <Separator className="mb-4" />

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Institute</span>
                <p className="font-medium">{profile?.institute_name || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Education Level</span>
                <p className="font-medium">{profile?.education_level || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Degree</span>
                <p className="font-medium">{profile?.degree || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Academic Year</span>
                <p className="font-medium">{profile?.academic_year || '—'}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <Link href="/dashboard/profile/edit">
                <Button variant="outline" size="sm">Edit profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
