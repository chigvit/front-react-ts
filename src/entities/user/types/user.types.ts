// entities/user/types/user.types.ts


export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    postCode: string;
    userType: 'client' | 'specialist';
    specialistType?: 'master' | 'organization';
  }
  
  export interface RegistrationData {
    firstName: string;
    lastName: string;
    email: string;
    postCode: string;
    userType: 'client' | 'specialist';
    specialistType?: 'master' | 'organization';
  }

  export interface UserLoginData {
    email: string;
    password: string;
  }