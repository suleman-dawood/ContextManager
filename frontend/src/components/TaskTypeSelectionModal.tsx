import { X } from 'lucide-react';
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
              className="btn btn-primary task-type-button"
              onClick={onSelectSingle}
            >
              <span className="task-type-button-title">Single Task</span>
              <span className="task-type-button-description">
                A one-time task that you complete once
              </span>
            </button>

            <button
              type="button"
              className="btn btn-secondary task-type-button"
              onClick={onSelectRecurring}
            >
              <span className="task-type-button-title">Recurring Task</span>
              <span className="task-type-button-description">
                A task that repeats automatically on a schedule (daily, weekly, monthly, etc.)
              </span>
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
