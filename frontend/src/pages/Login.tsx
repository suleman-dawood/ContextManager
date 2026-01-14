import { ClipboardList } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthForm } from '../hooks/useAuthForm';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import '../styles/Login.css';

export function Login() {
  const { loading, error, login, register } = useAuth();
  const { isLogin, setIsLogin, loginData, setLoginData, registerData, setRegisterData } = useAuthForm();

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <ClipboardList size={48} color="#FFD700" />
          <h1>Context Manager</h1>
          <p>AI-powered task management systemfor more focused work sessions</p>
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
            error={error || ''}
            onChange={setLoginData}
            onSubmit={() => login(loginData)}
          />
        ) : (
          <RegisterForm
            registerData={registerData}
            loading={loading}
            error={error || ''}
            onChange={setRegisterData}
            onSubmit={() => register(registerData)}
          />
        )}
      </div>
    </div>
  );
}
