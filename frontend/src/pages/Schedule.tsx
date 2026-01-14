import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import ScheduleView from '../components/ScheduleView';
import { AppHeader } from '../components/AppHeader';
import { useEffect } from 'react';
import '../styles/Schedule.css';

export function Schedule() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(function() {
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
}

