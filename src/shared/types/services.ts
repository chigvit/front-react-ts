interface Service {
  id: number;
  name: string;
}

interface ServiceCategory {
  id: number;
  name: string;
  services: Service[];
}