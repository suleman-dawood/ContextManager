import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { authApi } from '../services/api';
import { saveAuth } from '../services/auth';
import type { LoginRequest, RegisterRequest } from '../types';

/**
 * Login and registration page
 */
export const Login = () => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authApi.login(loginData);
      saveAuth(response);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
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
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Brain size={48} color="#3B82F6" />
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

        {error && <div className="error-message">{error}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="label">Name</label>
              <input
                type="text"
                className="input"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .login-container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h1 {
          font-size: 28px;
          margin: 16px 0 8px;
          color: var(--gray-900);
        }

        .login-header p {
          color: var(--gray-600);
          font-size: 14px;
        }

        .auth-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          background: var(--gray-100);
          padding: 4px;
          border-radius: 8px;
        }

        .auth-tabs button {
          flex: 1;
          padding: 10px;
          background: none;
          border: none;
          font-weight: 600;
          color: var(--gray-600);
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .auth-tabs button.active {
          background: white;
          color: var(--gray-900);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .error-message {
          background: #FEE2E2;
          color: #DC2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        form .btn {
          width: 100%;
          justify-content: center;
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
};

