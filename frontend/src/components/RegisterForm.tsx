import type { RegisterRequest } from '../types';
import { Error } from './Error';
import '../styles/Login.css';

interface RegisterFormProps {
  registerData: RegisterRequest;
  loading: boolean;
  error: string;
  onChange: (data: RegisterRequest) => void;
  onSubmit: () => Promise<void>;
}

export function RegisterForm({ registerData, loading, error, onChange, onSubmit }: RegisterFormProps) {

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit();
  }

  return (
    <>
      {error && <Error message={error} />}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Name</label>
          <input
            type="text"
            className="input"
            value={registerData.name}
            onChange={(e) => onChange({ ...registerData, name: e.target.value })}
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
            onChange={(e) => onChange({ ...registerData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            value={registerData.password}
            onChange={(e) => onChange({ ...registerData, password: e.target.value })}
            required
            minLength={6}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </>
  );
}

