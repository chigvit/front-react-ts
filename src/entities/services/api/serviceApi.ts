// src/entities/service/api/serviceApi.ts

import { Service, ServiceCategory } from '../model/types';

export class ServiceApi {
  private static baseUrl = '/api';

  static async getServiceCategories(): Promise<ServiceCategory[]> {
    const response = await fetch(`${this.baseUrl}/service-categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch service categories');
    }
    return response.json();
  }

  static async getServices(): Promise<Service[]> {
    const response = await fetch(`${this.baseUrl}/services`);
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }
    return response.json();
  }

  static async getUserServices(): Promise<Service[]> {
    const response = await fetch(`${this.baseUrl}/user/services`);
    if (!response.ok) {
      throw new Error('Failed to fetch user services');
    }
    return response.json();
  }

  static async updateUserServices(serviceIds: number[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/user/services`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_ids: serviceIds
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user services');
    }
  }
}