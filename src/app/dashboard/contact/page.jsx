'use client'

import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardContent } from '@/components/ui/card'

export default function ContactPage() {
  return (
    <div>
      <DashboardHeader title="Contact" subtitle="Get in touch with us" />
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Reach out to us at{' '}
            <a href="mailto:campusconnect@gmail.com" className="text-primary hover:underline font-medium">
              campusconnect@gmail.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
