export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  iconUrl?: string
  sortOrder: number
  isActive: boolean
}

export interface WorkType {
  id: number
  categoryId: number
  name: string
  slug: string
  description?: string
  iconUrl?: string
  sortOrder: number
  isActive: boolean
}
