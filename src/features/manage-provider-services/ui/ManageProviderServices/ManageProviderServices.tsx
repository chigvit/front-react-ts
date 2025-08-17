// src/features/manage-provider-services/ui/ManageProviderServices/ManageProviderServices.tsx

import React from 'react';
import { ServiceCategoryItem } from '@/entities/services/ui/ServiceCategoryItem/ServiceCategoryItem';
import { useManageServices } from '../../model/useManageServices';
import './ManageProviderServices.css';

export const ManageProviderServices: React.FC = () => {
  const {
    serviceCategories,
    loading,
    saving,
    error,
    expandedCategory,
    getServicesForCategory,
    getSelectedServicesForCategory,
    getTotalSelectedServices,
    toggleCategory,
    toggleService,
    saveServices
  } = useManageServices();

  const handleSaveServices = async () => {
    try {
      await saveServices();
      alert('Послуги успішно збережено!');
    } catch (error) {
      alert('Помилка збереження послуг');
    }
  };

  if (loading) {
    return (
      <div className="manage-services">
        <div className="manage-services__loading">
          <div className="manage-services__loading-text">Завантаження...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-services">
        <div className="manage-services__error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const totalSelected = getTotalSelectedServices();

  return (
    <div className="manage-services">
      <div className="manage-services__content">
        <div className="manage-services__header">
          <h2 className="manage-services__title">Типи робіт</h2>
          <p className="manage-services__description">
            Натисніть на категорію, щоб побачити доступні послуги
          </p>
        </div>

        <div className="manage-services__categories">
          {serviceCategories.map((category) => {
            const categoryServices = getServicesForCategory(category.id);
            const selectedServices = getSelectedServicesForCategory(category.id);
            const isExpanded = expandedCategory === category.id;

            return (
              <ServiceCategoryItem
                key={category.id}
                category={category}
                services={categoryServices}
                selectedServices={selectedServices}
                isExpanded={isExpanded}
                onToggleCategory={toggleCategory}
                onToggleService={toggleService}
              />
            );
          })}
        </div>

        <div className="manage-services__actions">
          <button
            onClick={handleSaveServices}
            disabled={saving}
            className="manage-services__save-button"
          >
            {saving ? 'Збереження...' : 'Зберегти послуги'}
          </button>
        </div>

        {totalSelected > 0 && (
          <div className="manage-services__summary">
            <h3 className="manage-services__summary-title">Обрані послуги:</h3>
            <div className="manage-services__summary-text">
              Загалом обрано: {totalSelected} послуг
            </div>
          </div>
        )}
      </div>
    </div>
  );
};