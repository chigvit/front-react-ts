// entities/auth/model/auth.store.ts
import { create } from 'zustand';
import { authApi } from '@/shared/api/auth/auth.api';

type UserStatus =     'USER_STATUS_ACTIVE'|'USER_STATUS_INACTIVE'|'USER_STATUS_SUSPENDED'|'USER_STATUS_PENDING_VERIFICATION'

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  user_status: UserStatus;
}

interface AuthStore {
  // Authentication state
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Email confirmation state
  isConfirming: boolean;
  confirmationResult: {
    success: boolean;
    message: string;
  } | null;
  
  // Authentication methods
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  
  // Email confirmation methods
  confirmEmail: (token: string) => Promise<void>;
  resetConfirmation: () => void;
  
  // Authorization methods
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isUserActive: () => boolean;
  needsEmailConfirmation: () => boolean;
  isUserBlocked: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Authentication state
  user: null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  isAuthenticated: false,
  isLoading: false,
  
  // Email confirmation state
  isConfirming: false,
  confirmationResult: null,
  
  // Authentication methods
  
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const result = await authApi.login({ email, password });
      
      // Перевіряємо статус користувача
      if (result.user.user_status === 'USER_STATUS_SUSPENDED') {
        throw new Error('Акаунт заблокований');
      }
      
      set({ 
        user: result.user,
        accessToken: result.accessToken,
        isAuthenticated: result.user.user_status === 'USER_STATUS_ACTIVE',
        isLoading: false 
      });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', result.accessToken);
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    set({ 
      user: null, 
      accessToken: null, 
      isAuthenticated: false 
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  },
  
  getCurrentUser: async () => {
    const token = get().accessToken;
    if (!token) return;
    
    try {
      const user = await authApi.getCurrentUser();
      set({ 
        user,
        isAuthenticated: user.user_status === 'USER_STATUS_ACTIVE',
      });
    } catch (error) {
      get().logout();
    }
  },
  
  // Email confirmation methods
  confirmEmail: async (token: string) => {
    set({ isConfirming: true });
    
    try {
      const result = await authApi.confirmEmail({ confirm_token: token });
      set({ 
        confirmationResult: result,
        isConfirming: false 
      });
      
      // Оновити статус користувача після успішного підтвердження
      if (result.success && get().user) {
        const updatedUser = { 
          ...get().user!, 
          user_status: 'USER_STATUS_ACTIVE' as UserStatus
        };
        set({ 
          user: updatedUser,
          isAuthenticated: true
        });
      }
    } catch (error) {
      set({ 
        confirmationResult: {
          success: false,
          message: error instanceof Error ? error.message : 'Помилка підтвердження email'
        },
        isConfirming: false 
      });
    }
  },
  
  resetConfirmation: () => {
    set({ confirmationResult: null });
  },
  
  // Authorization methods
  hasPermission: (permission: string) => {
    const user = get().user;
    return user?.permissions?.includes(permission) ?? false;
  },
  
  hasRole: (role: string) => {
    const user = get().user;
    return user?.roles?.includes(role) ?? false;
  },
  
  // User status check methods
  isUserActive: () => {
    return get().user?.user_status === 'USER_STATUS_ACTIVE';
  },
  
  needsEmailConfirmation: () => {
    return get().user?.user_status === 'USER_STATUS_PENDING_VERIFICATION';
  },
  
  isUserBlocked: () => {
    return get().user?.user_status === 'USER_STATUS_SUSPENDED' || get().user?.user_status === 'USER_STATUS_INACTIVE';
  },
}));