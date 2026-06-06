export type OrderType = 'OPEN' | 'DIRECT'

export type OrderStatus = 
  | 'OPEN' 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'REJECTED'

export interface Order {
  id: string
  orderType: OrderType
  customerId: string
  masterId?: string
  workTypeId: number
  title: string
  description?: string
  status: OrderStatus
  budget: number
  finalPrice?: number
  address?: string
  latitude?: number
  longitude?: number
  scheduledAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface OrderResponse {
  id: string
  orderId: string
  masterId: string
  message?: string
  price: number
  isAccepted: boolean
  createdAt: string
}

export interface CreateOrderRequest {
  orderType: OrderType
  masterId?: string
  workTypeId: number
  title: string
  description?: string
  budget: number
  address?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
  scheduledAt?: string
}