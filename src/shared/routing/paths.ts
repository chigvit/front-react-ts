type CatalogParams = {
    genre?: string;
    rating?: string;
    year?: string;
    sort?: string;
  };
  
  type Id = number | null | undefined;
  
  export const paths = {
    home: '/',
    band: '#',
    collections: '#',

    new_order: '/new_order',
    search: '/search',
    login: '/login',
    register: '/register',
  
    cartoons: '/cartoons',
    favorites: '/profile/favorites',
    settings: '/profile/settings',
    history: '/profile/history',
  
    // Get the URL for the movie catalog page
    catalog: (params: CatalogParams): string => {
      const searchParams = new URLSearchParams({ ...params });
      const url = `/films?${searchParams}`;
  
      return url;
    },
  
    // Get the URL for the movie page
    movie: (id: Id): string => `/film/${id}`,
  
    // Get the URL for the person page
    person: (id: Id): string => `/name/${id}`,
  };
  