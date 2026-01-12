import type { AuthResponse, User } from '../types';

/**
 * Save authentication data to localStorage
 */
export const saveAuth = (authData: AuthResponse): void => {
  localStorage.setItem('token', authData.token);
  localStorage.setItem('user', JSON.stringify({
    id: authData.userId,
    email: authData.email,
    name: authData.name
  }));
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

/**
 * Get auth token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

/**
 * Logout and clear authentication data
 */
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

