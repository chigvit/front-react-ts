import { apiClient } from '@/shared/api/client'
import { Category, WorkType } from '../model/types'

export const categoryApi = {
  getAll: async (): Promise<{ categories: Category[] }> => {
    const res = await apiClient.get('/api/v1/categories')
    return res.data
  },

  getByID: async (id: number): Promise<{ category: Category }> => {
    const res = await apiClient.get(`/api/v1/categories/${id}`)
    return res.data
  },

  getWorkTypes: async (categoryId: number): Promise<{ workTypes: WorkType[] }> => {
    const res = await apiClient.get(`/api/v1/categories/${categoryId}/work-types`)
    return res.data
  },

  getAllWorkTypes: async (): Promise<{ workTypes: WorkType[] }> => {
    const res = await apiClient.get('/api/v1/work-types')
    return res.data
  },
}
