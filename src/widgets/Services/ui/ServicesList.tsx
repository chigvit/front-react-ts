
import React from 'react';
import { ServiceCard } from './ServiceCard';
import { ServiceCategory } from '@/entities/service';

interface ServicesListProps {
    services: ServiceCategory[];
}

export const ServicesList: React.FC<ServicesListProps> = ({ services }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((category) => (
                <ServiceCard key={category.id} category={category} />
            ))}
        </div>
    );
};