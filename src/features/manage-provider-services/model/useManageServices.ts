// src/features/manage-provider-services/model/useManageServices.ts

import { useState, useEffect } from 'react';
import { ServiceApi } from '@/entities/services/api/serviceApi';
import { Service, ServiceCategory, UserServiceSelection } from '@/entities/services/model/types';

export const useManageServices = () => {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<UserServiceSelection>({});
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Завантаження даних
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoriesData, servicesData, userServicesData] = await Promise.all([
        ServiceApi.getServiceCategories(),
        ServiceApi.getServices(),
        ServiceApi.getUserServices()
      ]);
      
      setServiceCategories(categoriesData);
      setServices(servicesData);
      
      // Формування об'єкта вибраних послуг
      const initialSelected: UserServiceSelection = {};
      userServicesData.forEach((service: Service) => {
        if (!initialSelected[service.category_id]) {
          initialSelected[service.category_id] = [];
        }
        initialSelected[service.category_id].push(service.id);
      });
      setSelectedServices(initialSelected);
      
    } catch (error) {
      console.error('Помилка завантаження даних:', error);
      setError('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Отримання послуг для конкретної категорії
  const getServicesForCategory = (categoryId: number): Service[] => {
    return services.filter(service => service.category_id === categoryId);
  };

  // Переключення розгорнутої категорії
  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  // Обробка зміни чекбокса послуги
  const toggleService = (categoryId: number, serviceId: number) => {
    setSelectedServices(prev => {
      const newSelected = { ...prev };
      
      if (!newSelected[categoryId]) {
        newSelected[categoryId] = [];
      }
      
      const serviceIndex = newSelected[categoryId].indexOf(serviceId);
      if (serviceIndex > -1) {
        // Видалити послугу
        newSelected[categoryId] = newSelected[categoryId].filter(id => id !== serviceId);
        if (newSelected[categoryId].length === 0) {
          delete newSelected[categoryId];
        }
      } else {
        // Додати послугу
        newSelected[categoryId] = [...newSelected[categoryId], serviceId];
      }
      
      return newSelected;
    });
  };

  // Збереження обраних послуг
  const saveServices = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Формування масиву всіх обраних послуг
      const selectedServiceIds: number[] = [];
      Object.values(selectedServices).forEach(categoryServices => {
        selectedServiceIds.push(...categoryServices);
      });
      
      await ServiceApi.updateUserServices(selectedServiceIds);
      
    } catch (error) {
      console.error('Помилка збереження послуг:', error);
      setError('Помилка збереження послуг');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Отримання кількості обраних послуг в категорії
  const getSelectedServicesForCategory = (categoryId: number): number[] => {
    return selectedServices[categoryId] || [];
  };

  // Підрахунок загальної кількості обраних послуг
  const getTotalSelectedServices = (): number => {
    return Object.values(selectedServices).flat().length;
  };

  return {
    serviceCategories,
    services,
    selectedServices,
    expandedCategory,
    loading,
    saving,
    error,
    getServicesForCategory,
    toggleCategory,
    toggleService,
    saveServices,
    getSelectedServicesForCategory,
    getTotalSelectedServices,
    loadData
  };
};