import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail } from 'lucide-react';
import { getCurrentUser } from '../services/auth';

/**
 * Settings page (simple user profile display)
 */
export const Settings = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  return (
    <div className="settings-page">
      <header className="settings-header">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <h1>Settings</h1>
      </header>

      <div className="container">
        <div className="settings-content">
          <section className="settings-section">
            <h2>Profile Information</h2>
            <div className="profile-info">
              <div className="info-item">
                <User size={20} />
                <div>
                  <div className="info-label">Name</div>
                  <div className="info-value">{user?.name}</div>
                </div>
              </div>
              <div className="info-item">
                <Mail size={20} />
                <div>
                  <div className="info-label">Email</div>
                  <div className="info-value">{user?.email}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <h2>About Context Manager</h2>
            <p>
              Context Manager is an AI-powered task management application that helps you organize
              work by mental context. Using Claude AI, it intelligently suggests which tasks to work
              on based on your current context and time of day.
            </p>
            <p className="version">Version 1.0.0</p>
          </section>
        </div>
      </div>

      <style>{`
        .settings-page {
          min-height: 100vh;
          background: var(--gray-50);
        }

        .settings-header {
          background: white;
          padding: 24px;
          border-bottom: 1px solid var(--gray-200);
        }

        .settings-header h1 {
          font-size: 24px;
          margin: 16px 0 0 0;
        }

        .settings-content {
          max-width: 800px;
          margin: 32px auto;
        }

        .settings-section {
          background: white;
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .settings-section h2 {
          font-size: 20px;
          margin: 0 0 24px 0;
        }

        .settings-section p {
          color: var(--gray-600);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--gray-50);
          border-radius: 8px;
        }

        .info-item > svg {
          color: var(--primary);
        }

        .info-label {
          font-size: 13px;
          color: var(--gray-600);
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: var(--gray-900);
        }

        .version {
          font-size: 12px;
          color: var(--gray-500);
          margin: 0;
        }
      `}</style>
    </div>
  );
};

