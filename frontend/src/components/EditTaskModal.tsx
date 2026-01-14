import { useState } from 'react';
import { X } from 'lucide-react';
import { useTaskForm } from '../hooks/useTaskForm';
import type { Task, UpdateTaskRequest, Context } from '../types';
import { Priority, TaskStatus } from '../types';
import '../styles/EditTaskModal.css';

interface EditTaskModalProps {
  task: Task;
  contexts: Context[];
  onClose: () => void;
  onSubmit: (taskId: string, updates: UpdateTaskRequest) => Promise<void>;
}

export function EditTaskModal({ task, contexts, onClose, onSubmit }: EditTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const { formData, updateTitle, updateDescription, updateEstimatedMinutes, updatePriority, updateDueDate, updateContextId, updateStatus } = useTaskForm(task);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(task.id, formData as UpdateTaskRequest);
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
              onChange={(e) => updateTitle(e.target.value)}
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
              onChange={(e) => updateDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="label">Context *</label>
            <select
              className="input"
              value={'contextId' in formData ? formData.contextId : ''}
              onChange={(e) => updateContextId(e.target.value)}
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
                onChange={(e) => updateEstimatedMinutes(parseInt(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="label">Priority</label>
              <select
                className="input"
                value={formData.priority}
                onChange={(e) => updatePriority(parseInt(e.target.value) as Priority)}
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
                value={'status' in formData ? formData.status : TaskStatus.Todo}
                onChange={(e) => updateStatus(parseInt(e.target.value) as TaskStatus)}
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
                onChange={(e) => updateDueDate(e.target.value || undefined)}
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
}
