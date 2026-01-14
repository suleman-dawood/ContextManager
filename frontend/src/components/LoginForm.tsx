import type { LoginRequest } from '../types';
import '../styles/Login.css';

interface LoginFormProps {
  loginData: LoginRequest;
  loading: boolean;
  error: string;
  onChange: (data: LoginRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({ loginData, loading, error, onChange, onSubmit }: LoginFormProps) {
  return (
    <>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={loginData.email}
            onChange={(e) => onChange({ ...loginData, email: e.target.value })}
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
            onChange={(e) => onChange({ ...loginData, password: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </>
  );
}

