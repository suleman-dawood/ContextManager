import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { suggestionsApi } from '../services/api';
import type { Context, CreateTaskRequest, ContextCategorizationResponse } from '../types';
import { Priority } from '../types';

interface CreateTaskModalProps {
  contexts?: Context[]; // Optional, no longer used but kept for backward compatibility
  onClose: () => void;
  onSubmit: (task: CreateTaskRequest) => Promise<void>;
}

/**
 * Modal for creating a new task
 */
export const CreateTaskModal = ({ onClose, onSubmit }: CreateTaskModalProps) => {
  const [loading, setLoading] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [categorization, setCategorization] = useState<ContextCategorizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<CreateTaskRequest, 'contextId'>>({
    title: '',
    description: '',
    estimatedMinutes: 30,
    priority: Priority.Medium,
    dueDate: undefined
  });

  // Auto-categorize task on submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // First, categorize the task with AI
      setCategorizing(true);
      const result = await suggestionsApi.categorizeTask({
        title: formData.title,
        description: formData.description
      });
      setCategorization(result);
      setCategorizing(false);

      // Then submit with the AI-selected context
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
        <div className="modal-header">
          <h2>Create New Task</h2>
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

          {categorization && (
            <div style={{
              padding: '12px',
              marginBottom: '12px',
              backgroundColor: '#FFD700',
              border: '2px solid #000000',
              borderRadius: 0,
              fontSize: '13px',
              color: 'var(--black)'
            }}>
              <strong>AI Selected Context: {categorization.contextName}</strong>
              <br />
              <span style={{ opacity: 0.8 }}>{categorization.reasoning}</span>
              <br />
              <span style={{ fontSize: '11px', opacity: 0.7 }}>
                Confidence: {Math.round(categorization.confidence * 100)}%
              </span>
            </div>
          )}
          
          {categorizing && (
            <div style={{
              padding: '12px',
              marginBottom: '12px',
              backgroundColor: '#FFD700',
              border: '2px solid #000000',
              borderRadius: 0,
              fontSize: '13px',
              color: 'var(--black)',
              textAlign: 'center'
            }}>
              <Sparkles size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              AI is analyzing your task...
          </div>
          )}
          
          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '12px',
              backgroundColor: '#FF6B6B',
              border: '2px solid #000000',
              borderRadius: 0,
              fontSize: '13px',
              color: 'var(--black)'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

          <div className="form-group">
            <label className="label">Due Date</label>
            <input
              type="date"
              className="input"
              value={formData.dueDate || ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value || undefined })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>

        <style>{`
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--black);
          }

          .modal-header h2 {
            margin: 0;
            font-size: 24px;
            color: var(--black);
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          textarea.input {
            resize: vertical;
            font-family: inherit;
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 2px solid var(--black);
          }
        `}</style>
      </div>
    </div>
  );
};

