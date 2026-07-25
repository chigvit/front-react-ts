import { Suspense } from 'react'
import { CreateOrderPage } from '@/views/orders/ui/CreateOrderPage'

export default function CreateOrder() {
  return (
    <Suspense fallback={null}>
      <CreateOrderPage />
    </Suspense>
  )
}
