import type { AuthResponse, User } from '../types';

/**
 * Save authentication data to localStorage
 */
export const saveAuth = (authData: AuthResponse | any): void => {
  // Handle both camelCase (token) and PascalCase (Token) for compatibility
  const token = authData.token || authData.Token;
  const userId = authData.userId || authData.UserId;
  const email = authData.email || authData.Email;
  const name = authData.name || authData.Name;
  
  if (!token) {
    console.error('No token found in auth response:', authData);
    throw new Error('Invalid authentication response');
  }
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({
    id: userId,
    email: email,
    name: name
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

