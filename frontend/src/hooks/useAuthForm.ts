import { useState } from 'react';
import type { LoginRequest, RegisterRequest } from '../types';

export function useAuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  
  const [loginData, setLoginData] = useState<LoginRequest>({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterRequest>({
    email: '',
    name: '',
    password: ''
  });

  return {
    isLogin,
    setIsLogin,
    loginData,
    setLoginData,
    registerData,
    setRegisterData
  };
}

