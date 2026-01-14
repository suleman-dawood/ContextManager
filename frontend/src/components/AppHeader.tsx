import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Calendar, LogOut } from 'lucide-react';
import '../styles/AppHeader.css';

export const AppHeader = () => {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

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
    </header>
  );
};

