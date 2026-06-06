import { apiClient } from '@/shared/api/client'
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../model/types'

const toProfile = (data: any): UserProfile => ({
  id: data.user_id,
  email: data.email,
  phone: data.phone,
  firstName: data.first_name,
  lastName: data.last_name,
  avatarUrl: data.avatar_url,
  role: data.user_role,
  status: data.user_status,
  isEmailVerified: data.is_email_verified,
  postcode: data.postcode,
  languages: data.languages ?? [],
  masterProfile: data.master_profile ? {
    bio: data.master_profile.bio,
    experienceYears: data.master_profile.experience_years,
    isVerified: data.master_profile.is_verified,
    rating: data.master_profile.rating,
    reviewsCount: data.master_profile.reviews_count,
    radiusMiles: data.master_profile.radius_miles,
  } : undefined,
})

export const userApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post('/api/v1/auth/login', {
      email: data.email,
      password: data.password,
    })
    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
      userId: res.data.user_id,
      userRole: res.data.user_role,
    }
  },

  register: async (data: RegisterRequest): Promise<{ userId: string; message: string }> => {
    const res = await apiClient.post('/api/v1/auth/register', {
      email: data.email,
      password: data.password,
      phone: data.phone,
      first_name: data.firstName,
      last_name: data.lastName,
      user_role: data.userRole,
      postcode: data.postcode,
    })
    return res.data
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout', { refresh_token: refreshToken })
  },

  getProfile: async (token?: string): Promise<UserProfile> => {
    const res = await apiClient.get('/api/v1/users/profile', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    return toProfile(res.data)
  },

  updateProfile: async (data: any): Promise<UserProfile> => {
    const res = await apiClient.put('/api/v1/users/profile', {
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      postcode: data.postcode,
      bio: data.bio,
      experience_years: data.experienceYears,
      languages: data.languages,
      radius_miles: data.radiusMiles,
    })
    return toProfile(res.data)
  },
}
