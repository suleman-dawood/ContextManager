import { useState } from 'react';
import { X } from 'lucide-react';
import { Error } from './Error';
import '../styles/TaskFromNaturalLanguageModal.css';

interface TaskFromNaturalLanguageModalProps {
  onClose: () => void;
  onSubmit: (naturalLanguage: string) => Promise<void>;
}

export function TaskFromNaturalLanguageModal({ onClose, onSubmit }: TaskFromNaturalLanguageModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [naturalLanguage, setNaturalLanguage] = useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!naturalLanguage.trim()) {
      setError('Please enter a task description');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await onSubmit(naturalLanguage);
      setNaturalLanguage('');
      onClose();
    } catch (error: any) {
      console.error('Failed to generate task:', error);
      setError(error.response?.data?.message || 'Failed to generate task. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between divider-bottom">
          <h2>Task from Natural Language</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <Error message={error} />}
          
          <div className="form-group">
            <label className="label">Describe your task</label>
            <textarea 
              className="natural-language-input" 
              value={naturalLanguage} 
              onChange={(e) => setNaturalLanguage(e.target.value)} 
              required 
              autoFocus
              rows={4}
              placeholder="e.g., Review the quarterly report and prepare presentation slides by Friday"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !naturalLanguage.trim()}>
              {loading ? 'Generating...' : 'Generate Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}