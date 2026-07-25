import { Suspense } from 'react'
import { ProfilePage } from '@/views/profile/ui/ProfilePage'

export default function Profile() {
  return (
    <Suspense fallback={null}>
      <ProfilePage />
    </Suspense>
  )
}
