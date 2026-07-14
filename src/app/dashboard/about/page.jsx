import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardContent } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div>
      <DashboardHeader title="About" subtitle="Learn more about Campus Connect" />
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Campus Connect is a centralized platform designed to streamline club and event management across college campuses.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 pt-4">
              <div>
                <h3 className="font-medium text-sm mb-2">For Students</h3>
                <p className="text-sm text-muted-foreground">Discover events, join clubs, and stay connected with campus life.</p>
              </div>
              <div>
                <h3 className="font-medium text-sm mb-2">For Clubs</h3>
                <p className="text-sm text-muted-foreground">Manage members, publish events, and grow your community.</p>
              </div>
              <div>
                <h3 className="font-medium text-sm mb-2">For Admins</h3>
                <p className="text-sm text-muted-foreground">Verify content, manage users, and oversee the platform.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
