export type RegistrationData = {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    postcode: string;
    type?: 'customer' | 'contractor';
    contractorType?: 'specialist' | 'master';
  };
  
  export type UserRole = 'customer' | 'contractor';
  export type WorkerType = 'specialist' | 'master';