import React from 'react';
import { ServiceCategoryList } from '@/widgets/service-category-list/ui/ServiceCategoryList';
import { Header } from "@/widgets/Header/ui/Header";
//import { Footer } fromq "../../widgets/Footer/ui/Footer";

export const HomePage: React.FC = () => {
  return (
    <div>
      <Header />
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Головна сторінка</h1>
        <p className="text-gray-600 mb-6">Welcome to Our Website</p>
       
      </main>
      
    </div>
  );
};

export default HomePage;

/*

 <ServiceCategoryList />

<main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Головна сторінка</h1>
        <p className="text-gray-600 mb-6">Welcome to Our Website</p>
        <ServiceList />
      </main>
      */
