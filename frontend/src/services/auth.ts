import type { AuthResponse, User } from '../types';

export function saveAuth(authData: AuthResponse): void {
  if (!authData.token) {
    throw new Error('Invalid authentication response');
  }
  
  localStorage.setItem('token', authData.token);
  localStorage.setItem('user', JSON.stringify({
    id: authData.userId,
    email: authData.email,
    name: authData.name
  }));
}

export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

