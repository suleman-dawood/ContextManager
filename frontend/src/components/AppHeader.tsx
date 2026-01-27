import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Folder, LogOut, Menu, X } from 'lucide-react';
import '../styles/AppHeader.css';

export const AppHeader = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  function handleNavigate(path: string) {
    navigate(path);
    setMobileMenuOpen(false);
  }

  function toggleMobileMenu() {
    setMobileMenuOpen(!mobileMenuOpen);
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">Context Manager</h1>
        
        <button 
          className="hamburger-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <nav className={`header-nav ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <button 
            className="nav-btn" 
            onClick={() => handleNavigate('/dashboard')}
            title="Dashboard"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            className="nav-btn" 
            onClick={() => handleNavigate('/schedule')}
            title="Schedule"
          >
            <Calendar size={20} />
            Schedule
          </button>
          <button 
            className="nav-btn" 
            onClick={() => handleNavigate('/contexts')}
            title="Contexts"
          >
            <Folder size={20} />
            Contexts
          </button>
          <button 
            className="nav-btn nav-btn-logout" 
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
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

