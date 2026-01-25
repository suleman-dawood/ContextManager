import { useState } from 'react';
import { X } from 'lucide-react';
import { tasksApi } from '../services/api';
import '../styles/DeleteRecurringTaskDialog.css';

interface DeleteRecurringTaskDialogProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
  onDeleteComplete: () => void;
}

export function DeleteRecurringTaskDialog({
  taskId,
  taskTitle,
  onClose,
  onDeleteComplete
}: DeleteRecurringTaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeleteInstance() {
    setLoading(true);
    setError(null);
    try {
      await tasksApi.deleteTaskInstance(taskId);
      onDeleteComplete();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task instance');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAll() {
    setLoading(true);
    setError(null);
    try {
      await tasksApi.deleteTaskAndAllInstances(taskId);
      onDeleteComplete();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete all instances');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal delete-recurring-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between divider-bottom">
          <h2>Delete Recurring Task</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="delete-recurring-content">
          <p className="delete-recurring-message">
            This is a recurring task: <strong>{taskTitle}</strong>
          </p>
          <p className="delete-recurring-question">What would you like to delete?</p>

          {error && (
            <div className="form-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div className="delete-recurring-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDeleteInstance}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Just This Instance'}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteAll}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'All Instances'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
