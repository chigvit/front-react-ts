import React, { useState, useEffect } from 'react';
import { fetchServices } from '@/features/services/api';
import styles from './service-dropdown.module.css';
//import type { ServiceCategory } from '@/shared/types/service';


export const ServiceDropdown = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const response = await fetchServices();
        setCategories(Object.values(response));
      } catch (err) {
        setError('Не вдалося завантажити послуги');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && categories.length === 0) {
      loadServices();
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setHoveredCategory(null);
  };

  return (
    <div className={styles.dropdownContainer} >
      <button 
        onClick={toggleDropdown}
        className={styles.dropdownButton}
        aria-expanded={isOpen}
      >
        Створити заявку {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div className={styles.dropdownContent}>
          {loading && <div className={styles.loading}>Завантаження...</div>}
          {error && <div className={styles.error}>{error}</div>}
          
          {!loading && !error && (
            <div className={styles.categoriesWrapper}>
              <ul className={styles.categoriesList}>
                {categories.map(category => (
                  <li
                    key={category.id}
                    className={styles.categoryItem}
                    onMouseEnter={() => setHoveredCategory(category.id)}
                  >
                    {category.name}
                  </li>
                ))}
              </ul>

              {hoveredCategory && (
                <ul className={styles.servicesList}>
                  {categories
                    .find(c => c.id === hoveredCategory)
                    ?.services.map(service => (
                      <li key={service.id} className={styles.serviceItem}>
                        <a 
                          href={`/order/service/${service.id}`}
                          className={styles.serviceLink}
                        >
                          {service.name}
                        </a>
                      </li>
                    ))
                  }
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
