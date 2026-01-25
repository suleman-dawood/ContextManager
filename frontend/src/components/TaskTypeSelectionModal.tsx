import { X, CheckSquare, Repeat } from 'lucide-react';
import '../styles/TaskTypeSelectionModal.css';

interface TaskTypeSelectionModalProps {
  onSelectSingle: () => void;
  onSelectRecurring: () => void;
  onClose: () => void;
}

export function TaskTypeSelectionModal({
  onSelectSingle,
  onSelectRecurring,
  onClose
}: TaskTypeSelectionModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal task-type-selection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between divider-bottom">
          <h2>What type of task?</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="task-type-selection-content">
          <p className="task-type-selection-message">
            Choose whether to create a single task or a recurring task that repeats automatically.
          </p>

          <div className="task-type-options">
            <button
              type="button"
              className="task-type-card task-type-card-single"
              onClick={onSelectSingle}
            >
              <div className="task-type-card-icon">
                <CheckSquare size={32} />
              </div>
              <div className="task-type-card-content">
                <span className="task-type-card-title">Single Task</span>
                <span className="task-type-card-description">
                  A one-time task that you complete once
                </span>
              </div>
            </button>

            <button
              type="button"
              className="task-type-card task-type-card-recurring"
              onClick={onSelectRecurring}
            >
              <div className="task-type-card-icon">
                <Repeat size={32} />
              </div>
              <div className="task-type-card-content">
                <span className="task-type-card-title">Recurring Task</span>
                <span className="task-type-card-description">
                  A task that repeats automatically on a schedule (daily, weekly, monthly, etc.)
                </span>
              </div>
            </button>
          </div>

          <div className="task-type-selection-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
