import { RefreshCw } from 'lucide-react';
import '../styles/ScheduleView.css';

interface ScheduleHeaderProps {
  selectedDate: Date;
  pendingTasksCount: number;
  loadingCount: boolean;
  generating: boolean;
  onDateChange: (date: Date) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onGeneratePlan: () => void;
}

export function ScheduleHeader({
  selectedDate,
  pendingTasksCount,
  loadingCount,
  generating,
  onDateChange,
  onPreviousDay,
  onNextDay,
  onToday,
  onGeneratePlan
}: ScheduleHeaderProps) {
  function formatDateForInput(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newDate = new Date(e.target.value + 'T00:00:00');
    onDateChange(newDate);
  }

  return (
    <div className="schedule-header">
      <div className="date-navigation">
        <button className="btn btn-icon" onClick={onPreviousDay}>
          ←
        </button>
        <input
          type="date"
          className="date-picker"
          value={formatDateForInput(selectedDate)}
          onChange={handleDateChange}
        />
        <button className="btn btn-icon" onClick={onNextDay}>
          →
        </button>
        <button className="btn btn-secondary" onClick={onToday}>
          Today
        </button>
      </div>

      <div className="header-actions">
        <div className="task-count-badge">
          {loadingCount ? (
            <span>Loading...</span>
          ) : (
            <span>
              {pendingTasksCount} {pendingTasksCount === 1 ? 'task' : 'tasks'} remaining
            </span>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={onGeneratePlan}
          disabled={generating || pendingTasksCount === 0}
        >
          
          <RefreshCw size={18} className={generating ? 'spinning' : ''} />
          {generating ? 'Generating...' : 'Generate Plan'}
        </button>
      </div>
    </div>
  );
}

