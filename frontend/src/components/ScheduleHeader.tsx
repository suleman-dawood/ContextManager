import { RefreshCw, ListTodo } from 'lucide-react';
import { useState } from 'react';
import { PendingTasksModal } from './PendingTasksModal';
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
  onTasksUpdated: () => void;
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
  onGeneratePlan,
  onTasksUpdated
}: ScheduleHeaderProps) {
  const [showPendingTasksModal, setShowPendingTasksModal] = useState(false);

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

  function handleTaskDeleted() {
    onTasksUpdated();
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
        <button 
          className="btn-icon-badge"
          onClick={() => setShowPendingTasksModal(true)}
          disabled={loadingCount}
          title={`${pendingTasksCount} ${pendingTasksCount === 1 ? 'task' : 'tasks'} remaining`}
        >
          <ListTodo size={24} />
          {!loadingCount && pendingTasksCount > 0 && (
            <span className="icon-badge-count">{pendingTasksCount}</span>
          )}
        </button>
        <button
          className="btn-icon-primary"
          onClick={onGeneratePlan}
          disabled={generating || pendingTasksCount === 0}
          title={generating ? 'Generating...' : 'Generate Plan'}
        >
          <RefreshCw size={24} className={generating ? 'spinning' : ''} />
        </button>
      </div>

      {showPendingTasksModal && (
        <PendingTasksModal
          onClose={() => setShowPendingTasksModal(false)}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}

