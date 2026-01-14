import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { suggestionsApi } from '../services/api';
import { useTaskForm } from '../hooks/useTaskForm';
import type { CreateTaskRequest, ContextCategorizationResponse } from '../types';
import { Priority } from '../types';
import '../styles/CreateTaskModal.css';

interface CreateTaskModalProps {
  onClose: () => void;
  onSubmit: (task: CreateTaskRequest) => Promise<void>;
}

export const CreateTaskModal = ({ onClose, onSubmit }: CreateTaskModalProps) => {
  const [loading, setLoading] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [categorization, setCategorization] = useState<ContextCategorizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { formData, updateTitle, updateDescription, updateEstimatedMinutes, updatePriority, updateDueDate } = useTaskForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      setCategorizing(true);
      const result = await suggestionsApi.categorizeTask({
        title: formData.title,
        description: formData.description
      });
      setCategorization(result);
      setCategorizing(false);

      const taskData: CreateTaskRequest = {
        ...formData,
        contextId: result.contextId
      };
      
      await onSubmit(taskData);
      onClose();
    } catch (error: any) {
      console.error('Failed to create task:', error);
      setCategorizing(false);
      setError(error.response?.data?.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between divider-bottom">
          <h2 className="heading-primary">Create New Task</h2>
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

          {categorization && (
            <div className="ai-categorization-alert alert alert-yellow">
              <strong>AI Selected Context: {categorization.contextName}</strong>
              <br />
              <span className="ai-categorization-reasoning">{categorization.reasoning}</span>
              <br />
              <span className="ai-categorization-confidence">
                Confidence: {Math.round(categorization.confidence * 100)}%
              </span>
            </div>
          )}
          
          {categorizing && (
            <div className="ai-categorizing alert alert-yellow">
              <Sparkles size={16} className="ai-categorizing-icon" />
              AI is analyzing your task...
            </div>
          )}
          
          {error && (
            <div className="error-message alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={formData.description}
              onChange={(e) => updateDescription(e.target.value)}
            />
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

          <div className="form-group">
            <label className="label">Due Date</label>
            <input
              type="date"
              className="input"
              value={formData.dueDate || ''}
              onChange={(e) => updateDueDate(e.target.value || undefined)}
            />
          </div>

          <div className="modal-actions flex-center divider-top">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
