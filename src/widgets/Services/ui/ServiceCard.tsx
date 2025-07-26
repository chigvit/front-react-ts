import React from 'react';
import { Link } from 'react-router-dom';
import { ServiceCategory } from '@/entities/service';

interface ServiceCardProps {
    category: ServiceCategory;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ category }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{category.title}</h3>
                <span className="text-sm text-gray-500">{category.totalCount} спеціалістів</span>
            </div>
            <div className="space-y-2">
                {category.services.map((service) => (
                    <Link
                        key={service.id}
                        to={`/services/${category.slug}/${service.slug}`}
                        className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md group"
                    >
                        <span className="text-gray-700 group-hover:text-blue-600">
                            {service.name}
                        </span>
                        <span className="text-sm text-gray-500">
                            {service.count}
                        </span>
                    </Link>
                ))}
            </div>
            <Link
                to={`/services/${category.slug}`}
                className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-sm"
            >
                Показати всі →
            </Link>
        </div>
    );
};