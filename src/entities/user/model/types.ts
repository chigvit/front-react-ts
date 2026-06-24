export type UserRole =
  | 'USER_TYPE_CUSTOMER'
  | 'USER_TYPE_MASTER'
  | 'USER_TYPE_COMPANY'

export type UserStatus =
  | 'USER_STATUS_UNSPECIFIED'
  | 'USER_STATUS_ACTIVE'
  | 'USER_STATUS_INACTIVE'
  | 'USER_STATUS_SUSPENDED'
  | 'USER_STATUS_PENDING_VERIFICATION'

export interface User {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  avatarUrl?: string
  role: UserRole
  status: UserStatus
  isEmailVerified: boolean
  postcode?: string
  languages?: string[]
}

export interface MasterProfileData {
  bio?: string
  experienceYears: number
  isVerified: boolean
  rating: number
  reviewsCount: number
  radiusMiles?: number
}

export interface UserProfile extends User {
  masterProfile?: MasterProfileData
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  phone?: string
  firstName: string
  lastName: string
  userRole: UserRole
  postcode?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  userId: string
  userRole: UserRole
}
