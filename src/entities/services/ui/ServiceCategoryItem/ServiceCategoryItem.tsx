// src/entities/service/ui/ServiceCategoryItem/ServiceCategoryItem.tsx

import React from 'react';
import { ServiceCategory, Service } from '../../model/types';
import './ServiceCategoryItem.css';

interface ServiceCategoryItemProps {
  category: ServiceCategory;
  services: Service[];
  selectedServices: number[];
  isExpanded: boolean;
  onToggleCategory: (categoryId: number) => void;
  onToggleService: (categoryId: number, serviceId: number) => void;
}

export const ServiceCategoryItem: React.FC<ServiceCategoryItemProps> = ({
  category,
  services,
  selectedServices,
  isExpanded,
  onToggleCategory,
  onToggleService,
}) => {
  const selectedCount = selectedServices.length;

  return (
    <div className="service-category-item">
      <button
        onClick={() => onToggleCategory(category.id)}
        className="service-category-item__header"
      >
        <div className="service-category-item__info">
          <h3 className="service-category-item__title">{category.name}</h3>
          <p className="service-category-item__description">
            {selectedCount > 0 
              ? `Обрано послуг: ${selectedCount} з ${services.length}`
              : `Доступно послуг: ${services.length}`
            }
          </p>
        </div>
        <div className="service-category-item__actions">
          {selectedCount > 0 && (
            <span className="service-category-item__badge">
              {selectedCount}
            </span>
          )}
          <svg
            className={`service-category-item__arrow ${isExpanded ? 'service-category-item__arrow--expanded' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="service-category-item__services">
          <div className="service-category-item__services-grid">
            {services.map((service) => (
              <label
                key={service.id}
                className="service-category-item__service"
              >
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.id)}
                  onChange={() => onToggleService(category.id, service.id)}
                  className="service-category-item__checkbox"
                />
                <span className="service-category-item__service-name">
                  {service.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};