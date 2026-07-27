import { Suspense } from 'react'
import { OrderSearchPage } from '@/views/orders/ui/OrderSearchPage'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrderSearchPage />
    </Suspense>
  )
}
