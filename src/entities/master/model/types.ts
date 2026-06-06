export interface Master {
  userId: string
  firstName: string
  lastName: string
  avatarUrl?: string
  rating: number
  reviewsCount: number
  distanceMeters?: number
}

export interface Rating {
  customerId: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

export interface FindMastersParams {
  lat: number
  lng: number
  radius?: number
}