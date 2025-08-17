// shared/api/auth.ts
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_role: 'USER_TYPE_CUSTOMER' | 'USER_TYPE_PROVIDER' | 'USER_TYPE_COMPANY';
  user_status: 'USER_STATUS_ACTIVE' | 'USER_STATUS_PENDING_VERIFICATION' | 'USER_STATUS_BLOCKED';
  customer_profile?: any;
  provider_profile?: any;
  created_at: string;
  updated_at: string;
}

export interface ConfirmEmailResponse {
  success: boolean;
  message: string;
  user: User;
}

const API_BASE_URL = 'http://localhost:8080';

export const confirmEmail = async (token: string): Promise<ConfirmEmailResponse> => {
  console.log('Confirming email with token:', token);
  try {
    const response = await fetch(`${API_BASE_URL}/api/account/confirm-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Перевіряємо Content-Type перед парсингом
    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response:', textResponse);
      throw new Error('Server returned non-JSON response');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(errorData.message || 'Email confirmation failed');
    }

    return response.json();
  } catch (error) {
    console.error('Confirm email error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the server is running.');
    }
    throw error;
  }
};