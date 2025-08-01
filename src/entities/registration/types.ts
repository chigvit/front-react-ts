export type RegistrationData = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    postcode: string;
    type?: 'customer' | 'contractor';
    contractorType?: 'specialist' | 'master';
  };
  
  export type UserRole = 'customer' | 'contractor';
  export type WorkerType = 'specialist' | 'master';