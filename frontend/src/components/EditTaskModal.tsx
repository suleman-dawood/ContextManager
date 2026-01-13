import { useState } from 'react';
import { X } from 'lucide-react';
import type { Task, UpdateTaskRequest, Context } from '../types';
import { Priority, TaskStatus } from '../types';
import '../styles/EditTaskModal.css';

interface EditTaskModalProps {
  task: Task;
  contexts: Context[];
  onClose: () => void;
  onSubmit: (taskId: string, updates: UpdateTaskRequest) => Promise<void>;
}

/**
 * Modal for editing an existing task
 */
export const EditTaskModal = ({ task, contexts, onClose, onSubmit }: EditTaskModalProps) => {
  const [loading, setLoading] = useState(false);
  
  // Convert ISO datetime to YYYY-MM-DD format for date input
  const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return undefined;
    return isoDate.split('T')[0];
  };
  
  const [formData, setFormData] = useState<UpdateTaskRequest>({
    contextId: task.contextId,
    title: task.title,
    description: task.description,
    estimatedMinutes: task.estimatedMinutes,
    priority: task.priority,
    status: task.status,
    dueDate: formatDateForInput(task.dueDate)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(task.id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between divider-bottom">
          <h2 className="heading-primary">Edit Task</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="label">Context *</label>
            <select
              className="input"
              value={formData.contextId}
              onChange={(e) => setFormData({ ...formData, contextId: e.target.value })}
              required
            >
              {contexts.map((context) => (
                <option key={context.id} value={context.id}>
                  {context.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Estimated Time (min)</label>
              <input
                type="number"
                className="input"
                min="5"
                step="5"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="label">Priority</label>
              <select
                className="input"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) as Priority })}
              >
                <option value={Priority.Low}>Low</option>
                <option value={Priority.Medium}>Medium</option>
                <option value={Priority.High}>High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Status</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) as TaskStatus })}
              >
                <option value={TaskStatus.Todo}>To Do</option>
                <option value={TaskStatus.InProgress}>In Progress</option>
                <option value={TaskStatus.Completed}>Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value || undefined })}
              />
            </div>
          </div>

          <div className="modal-actions flex-center divider-top">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

