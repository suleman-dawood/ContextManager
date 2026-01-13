import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import ScheduleView from '../components/ScheduleView';
import { AppHeader } from '../components/AppHeader';
import { useEffect } from 'react';
import '../styles/Schedule.css';

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
    <div className="schedule-page page-wrapper">
      <AppHeader />

      <ScheduleView />
    </div>
  );
};

