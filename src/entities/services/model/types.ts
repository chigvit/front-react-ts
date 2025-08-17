// src/entities/service/model/types.ts

export interface Service {
    id: number;
    name: string;
    category_id: number;
  }
  
  export interface ServiceCategory {
    id: number;
    name: string;
  }
  
  export interface UserServiceSelection {
    [categoryId: number]: number[];
  }