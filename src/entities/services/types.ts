export interface Service {
  id: number;
  name: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  services: Service[];
}

export type ServicesData = Record<string, ServiceCategory>;