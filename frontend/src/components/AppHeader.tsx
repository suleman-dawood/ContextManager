import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Calendar, LogOut } from 'lucide-react';

/**
 * Shared header component for all pages with navigation and logout
 */
export const AppHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">Context Manager</h1>
        <nav className="header-nav">
          <button 
            className="nav-btn" 
            onClick={() => navigate('/dashboard')}
            title="Dashboard"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            className="nav-btn" 
            onClick={() => navigate('/analytics')}
            title="Analytics"
          >
            <BarChart3 size={20} />
            Analytics
          </button>
          <button 
            className="nav-btn" 
            onClick={() => navigate('/schedule')}
            title="Schedule"
          >
            <Calendar size={20} />
            Schedule
          </button>
          <button 
            className="nav-btn nav-btn-logout" 
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </div>

      <style>{`
        .app-header {
          background: var(--white);
          border-bottom: 3px solid var(--black);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .app-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--black);
          margin: 0;
        }

        .header-nav {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--white);
          border: 2px solid var(--black);
          color: var(--black);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-btn:hover {
          background: var(--primary);
          color: var(--white);
          border-color: var(--primary);
        }

        .nav-btn-logout {
          background: var(--accent-orange);
          color: var(--white);
          border-color: var(--accent-orange);
        }

        .nav-btn-logout:hover {
          background: var(--danger);
          border-color: var(--danger);
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .header-nav {
            justify-content: center;
          }

          .nav-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
};

