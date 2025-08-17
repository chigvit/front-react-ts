// src/pages/DashboardProviderPage/DashboardProviderPage.tsx

import React from 'react';
import { Header } from "@/widgets/Header/ui/Header";
import { ManageProviderServices } from "@/features/manage-provider-services/ui/ManageProviderServices/ManageProviderServices";
import './DashboardProviderPage.css';

export const DashboardProviderPage: React.FC = () => {
  return (
    <div className="dashboard-provider-page">
      <Header />
      <main className="dashboard-provider-page__main">
        <div className="dashboard-provider-page__header">
          <h1 className="dashboard-provider-page__title">Панель виконавця</h1>
          <p className="dashboard-provider-page__description">
            Оберіть типи робіт, які ви виконуєте. Це допоможе клієнтам знайти вас для потрібних послуг.
          </p>
        </div>

        <ManageProviderServices />
      </main>
    </div>
  );
};

export default DashboardProviderPage;