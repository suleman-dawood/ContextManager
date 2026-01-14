import ScheduleView from '../components/ScheduleView';
import { AppHeader } from '../components/AppHeader';
import '../styles/Schedule.css';

export function Schedule() {
  return (
    <div className="schedule-page page-wrapper">
      <AppHeader />
      <ScheduleView />
    </div>
  );
}

