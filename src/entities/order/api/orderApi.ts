import { apiClient } from '@/shared/api/client'
import { Order, OrderResponse, CreateOrderRequest } from '../model/types'

export const orderApi = {
  create: async (data: CreateOrderRequest): Promise<{ order: Order }> => {
    const res = await apiClient.post('/api/v1/orders', data)
    return res.data
  },

  getByID: async (id: string): Promise<{ order: Order }> => {
    const res = await apiClient.get(`/api/v1/orders/${id}`)
    return res.data
  },

  getMy: async (): Promise<{ orders: Order[] }> => {
    const res = await apiClient.get('/api/v1/orders/my')
    return res.data
  },

  getIncoming: async (): Promise<{ orders: Order[] }> => {
    const res = await apiClient.get('/api/v1/orders/incoming')
    return res.data
  },

  getAvailable: async (params?: {
    workTypeId?: number
    lat?: number
    lng?: number
    radius?: number
  }): Promise<{ orders: Order[] }> => {
    const res = await apiClient.get('/api/v1/orders', { params })
    return res.data
  },

  cancel: async (id: string): Promise<void> => {
    await apiClient.post(`/api/v1/orders/${id}/cancel`)
  },

  complete: async (id: string): Promise<void> => {
    await apiClient.post(`/api/v1/orders/${id}/complete`)
  },

  accept: async (id: string): Promise<void> => {
    await apiClient.post(`/api/v1/orders/${id}/accept`)
  },

  reject: async (id: string): Promise<void> => {
    await apiClient.post(`/api/v1/orders/${id}/reject`)
  },

  getResponses: async (orderId: string): Promise<{ responses: OrderResponse[] }> => {
    const res = await apiClient.get(`/api/v1/orders/${orderId}/responses`)
    return res.data
  },

  createResponse: async (orderId: string, data: { message: string; price: number }): Promise<{ response: OrderResponse }> => {
    const res = await apiClient.post(`/api/v1/orders/${orderId}/responses`, data)
    return res.data
  },

  acceptResponse: async (orderId: string, responseId: string): Promise<void> => {
    await apiClient.post(`/api/v1/orders/${orderId}/responses/${responseId}/accept`)
  },
}