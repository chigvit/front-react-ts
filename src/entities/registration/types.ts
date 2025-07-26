export type RegistrationData = {
    name: string;
    phone: string;
    email: string;
    postcode: string;
    type?: 'customer' | 'worker';
    workerType?: 'specialist' | 'master';
  };
  
  export type RegistrationType = 'customer' | 'worker';
  export type WorkerType = 'specialist' | 'master';