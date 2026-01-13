import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '../services/auth';
import ScheduleView from '../components/ScheduleView';
import { useEffect } from 'react';

/**
 * Schedule page - AI-powered session planning with drag-and-drop
 */
export const Schedule = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [navigate, user]);

  return (
    <div className="schedule-page">
      <header className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <div>
          <h1>Session Planner</h1>
          <p>AI-powered daily task scheduling with smart context grouping</p>
        </div>
      </header>

      <ScheduleView />

      <style>{`
        .schedule-page {
          min-height: 100vh;
          background: var(--white);
        }

        .page-header {
          background: var(--white);
          padding: 24px;
          border-bottom: 3px solid var(--black);
          display: flex;
          gap: 24px;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .page-header h1 {
          font-size: 24px;
          margin: 0 0 4px 0;
          color: var(--black);
        }

        .page-header p {
          color: var(--black);
          font-size: 14px;
          margin: 0;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

