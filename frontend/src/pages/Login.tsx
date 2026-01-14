import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { authApi } from '../services/api';
import { saveAuth } from '../services/auth';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import type { LoginRequest, RegisterRequest } from '../types';
import '../styles/Login.css';

export function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState<LoginRequest>({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterRequest>({
    email: '',
    name: '',
    password: ''
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
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
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authApi.register(registerData);
      saveAuth(response);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Brain size={48} color="#FFD700" />
          <h1>Context Manager</h1>
          <p>AI-powered task management for focused work</p>
        </div>

        <div className="auth-tabs">
          <button
            className={isLogin ? 'active' : ''}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={!isLogin ? 'active' : ''}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <LoginForm
            loginData={loginData}
            loading={loading}
            error={error}
            onChange={setLoginData}
            onSubmit={handleLogin}
          />
        ) : (
          <RegisterForm
            registerData={registerData}
            loading={loading}
            error={error}
            onChange={setRegisterData}
            onSubmit={handleRegister}
          />
        )}
      </div>
    </div>
  );
}
