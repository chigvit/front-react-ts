import { OrderDetailPage } from '@/views/orders/ui/OrderDetailPage'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetail({ params }: Props) {
  const { id } = await params
  return <OrderDetailPage orderId={id} />
}
