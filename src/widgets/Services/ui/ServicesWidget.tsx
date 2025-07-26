import React from 'react';
import { ServicesList } from './ServicesList';
import { useServices } from '../model/useServices';

export const ServicesWidget: React.FC = () => {
    const { services, isLoading, error } = useServices();

    if (isLoading) return <div>Loading</div>;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

    return (
        <section className="py-8">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">Популярні послуги</h2>
                <ServicesList services={services} />
            </div>
        </section>
    );
};