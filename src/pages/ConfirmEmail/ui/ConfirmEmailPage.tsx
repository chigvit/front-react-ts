// pages/ConfirmEmailPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmEmail, User } from '@/shared/api/auth/auth';
import { useAuth } from '@/shared/contexts/AuthContext';

export const ConfirmEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [success, setSuccess] = useState(false);
  const hasCalledRef = useRef(false);
  
  // Додаємо useAuth hook
  const { login } = useAuth();

  useEffect(() => {
    // Якщо вже викликали API, не викликаємо знову
    if (hasCalledRef.current) {
      return;
    }

    const token = searchParams.get('token');
    console.log('Token from URL:', token);
    
    if (!token) {
      setError('Token is missing');
      setLoading(false);
      return;
    }

    // Позначаємо що почали процес підтвердження
    hasCalledRef.current = true;

    const handleConfirmEmail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await confirmEmail(token);
        setUser(response.user);
        setSuccess(true);
        
        // Використовуємо Auth Context для збереження стану автентифікації
        login(response.user, response.session_token || '');
        
        // 1. Зберігаємо користувача та токен сесії (тепер це робить login функція)
        // localStorage.setItem('user', JSON.stringify(response.user));
        // localStorage.setItem('session_token', response.session_token || '');
        // localStorage.setItem('isAuthenticated', 'true');
        
        // 2. Можете також зберегти в глобальному стані (Context, Zustand, Redux)
        // setGlobalUser(response.user);
        // setAuthToken(response.session_token);
        
        // 3. Визначаємо куди перенаправити користувача
        const redirectPath = determineRedirectPath(response.user);
        
        // Показуємо успіх протягом 3 секунд, потім перенаправляємо
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 3000);
        
      } catch (err) {
        console.error('Email confirmation error:', err);
        setError(err instanceof Error ? err.message : 'Email confirmation failed');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    handleConfirmEmail();
  }, [searchParams, navigate]);

  // Визначаємо куди перенаправити користувача залежно від його профілю
  const determineRedirectPath = (user: User): string => {
    // Якщо є незавершений профіль
    if (needsProfileCompletion(user)) {
      return '/complete_profile';
    }
    
    // Залежно від ролі користувача
    switch (user.user_role) {
      case 'USER_TYPE_PROVIDER':
        return '/dashboard_provider';
      case 'USER_TYPE_COMPANY':
        return '/dashboard_company';
      case 'USER_TYPE_CUSTOMER':
      default:
        return '/dashboard_customer';
    }
  };

  // Перевіряємо чи потрібно завершити профіль
  const needsProfileCompletion = (user: User): boolean => {
    // Логіка перевірки незавершеного профілю
    if (!user.phone || !user.postcode) {
      return true;
    }
    
    // Для провайдерів - перевіряємо provider_profile
    if (user.user_role === 'USER_TYPE_PROVIDER' && !user.provider_profile) {
      return true;
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirming your email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">✗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Confirmation Failed</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/login')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
            <button 
              onClick={() => navigate('/resend-confirmation')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Resend Confirmation Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success && user) {
    const redirectPath = determineRedirectPath(user);
    const needsCompletion = needsProfileCompletion(user);
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to the Platform!
          </h1>
          <p className="text-gray-600 mb-4">
            Hello, {user.first_name} {user.last_name}!
          </p>
          <p className="text-gray-600 mb-4">
            Your email <strong>{user.email}</strong> has been confirmed successfully.
          </p>
          
          {needsCompletion && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                Please complete your profile to get started.
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mb-6">
            Redirecting you in 3 seconds...
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate(redirectPath, { replace: true })}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {needsCompletion ? 'Complete Profile' : 'Go to Dashboard'}
            </button>
            
            {!needsCompletion && (
              <button 
                onClick={() => navigate('/profile')}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                View Profile
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};