import { apiClient } from '@/shared/api/client'
import { Master, Rating, FindMastersParams } from '../model/types'

export const masterApi = {
  findNearby: async (params: FindMastersParams): Promise<{ masters: Master[] }> => {
    const res = await apiClient.get('/api/v1/location/masters', { params: {
      lat: params.lat,
      lng: params.lng,
      radius: params.radius ?? 10000,
    }})
    return res.data
  },

  getRatings: async (masterId: string): Promise<{ ratings: Rating[]; averageRating: number; totalCount: number }> => {
    const res = await apiClient.get('/api/v1/ratings', { params: { master_id: masterId } })
    return res.data
  },

  updateLocation: async (latitude: number, longitude: number): Promise<void> => {
    await apiClient.put('/api/v1/location', { latitude, longitude })
  },
}