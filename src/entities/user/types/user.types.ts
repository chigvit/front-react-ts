// entities/user/types/user.types.ts


export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    postCode: string;
    userType: 'client' | 'specialist';
    specialistType?: 'master' | 'organization';
  }
  
  export interface RegistrationData {
    first_name: string;
    last_name: string;
    email: string;
    postCode: string;
    userType: 'client' | 'specialist';
    specialistType?: 'master' | 'organization';
  }

  export interface UserLoginData {
    email: string;
    password: string;
  }