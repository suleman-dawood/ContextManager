import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { saveAuth } from '../services/auth';
import type { LoginRequest, RegisterRequest } from '../types';

export function useAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(loginData: LoginRequest) {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(loginData);
      if (response && response.token) {
        saveAuth(response);
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Login failed';
        setError(errorMessage);
        throw err;
    } finally {
      setLoading(false);
    }
  }
 
  async function register(registerData: RegisterRequest) {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.register(registerData);
      saveAuth(response);
      navigate('/dashboard');
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Registration failed';
        setError(errorMessage);
        throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    login,
    register
  };
}

