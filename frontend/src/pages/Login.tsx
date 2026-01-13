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
          background: var(--black);
          padding: 20px;
        }

        .login-container {
          background: var(--white);
          border-radius: 0;
          border: 3px solid var(--accent-yellow);
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h1 {
          font-size: 28px;
          margin: 16px 0 8px;
          color: var(--black);
        }

        .login-header p {
          color: var(--black);
          font-size: 14px;
          opacity: 0.7;
        }

        .auth-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 24px;
          background: var(--white);
          border: 2px solid var(--black);
          border-radius: 0;
        }

        .auth-tabs button {
          flex: 1;
          padding: 10px;
          background: var(--white);
          border: none;
          border-right: 2px solid var(--black);
          font-weight: 600;
          color: var(--black);
          cursor: pointer;
          border-radius: 0;
          transition: all 0.2s;
        }

        .auth-tabs button:last-child {
          border-right: none;
        }

        .auth-tabs button.active {
          background: var(--accent-yellow);
          color: var(--black);
        }

        .auth-tabs button:hover:not(.active) {
          background: var(--gray-light);
        }

        .error-message {
          background: var(--white);
          color: var(--accent-orange);
          padding: 12px;
          border-radius: 0;
          border: 2px solid var(--accent-orange);
          margin-bottom: 20px;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

