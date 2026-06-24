import { OrderDetailPage } from '@/pages/orders/ui/OrderDetailPage'

export default function OrderDetail({ params }: { params: { id: string } }) {
  return <OrderDetailPage orderId={params.id} />
}
