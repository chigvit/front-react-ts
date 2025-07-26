import React, { useEffect, useState } from 'react';
import { fetchServices } from '../api/services';
import { Service, ServiceCategory } from '@/entities/services/types';
import styles from './ServiceCategoryList.module.css';

export const ServiceCategoryList: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetchServices();
        
        // Переконуємося, що отримані дані є масивом
        const services = Array.isArray(response) ? response : [response];
        
        // Групуємо сервіси по категоріям
        const categoriesMap: Record<number, ServiceCategory> = {};
        
        services.forEach((service: Service) => {
          if (!categoriesMap[service.category_id]) {
            categoriesMap[service.category_id] = {
              id: service.category_id,
              name: `Категорія ${service.category_id}`,
              services: [],
            };
          }
          categoriesMap[service.category_id].services.push(service);
        });

        setCategories(Object.values(categoriesMap));
      } catch (error) {
        setError('Не вдалося завантажити сервіси.');
        console.error('Помилка завантаження:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (loading) return <div className={styles.loading}>Завантаження...</div>;
  if (error) return <div className={styles.error}>Помилка: {error}</div>;
  if (categories.length === 0) return <div className={styles.empty}>Немає доступних послуг</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Оберіть послугу</h2>
      
      {categories.map((category) => (
        <div key={category.id} className={styles.category}>
          <div 
            className={styles.categoryHeader}
            onClick={() => toggleCategory(category.id)}
          >
            <span>{category.name}</span>
            <span className={styles.arrow}>
              {expandedCategory === category.id ? '▲' : '▼'}
            </span>
          </div>

          {expandedCategory === category.id && (
            <div className={styles.servicesList}>
              {category.services.map((service) => (
                <div key={service.id} className={styles.serviceItem}>
                  <div className={styles.serviceName}>{service.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};