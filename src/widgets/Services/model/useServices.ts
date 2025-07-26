import { useState, useEffect } from 'react';
import { servicesApi } from '../../../shared/api/services';
import type { Category, Subcategory, ServiceCategory } from '../../entities/service';

export const useServices = () => {
    const [services, setServices] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setIsLoading(true);
                const { categories, subcategories } = await servicesApi.getCategories();

                // Групуємо підкатегорії за category_id
                const serviceCategories = categories.map((category: Category) => {
                    const categorySubcategories = subcategories.filter(
                        (sub: Subcategory) => sub.category_id === category.id
                    );

                    return {
                        id: category.id,
                        name: category.name,
                        subcategories: categorySubcategories,
                        totalCount: categorySubcategories.reduce((sum, sub) => sum + (sub.count || 0), 0)
                    };
                });

                setServices(serviceCategories);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load services');
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();
    }, []);

    return { services, isLoading, error };
};