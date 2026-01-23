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
      let errorMessage = 'Failed to generate task. Please try again.';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'API endpoint not found. Please check if the backend is deployed correctly.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.response.status === 502) {
          errorMessage = 'AI service unavailable. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || `Server error (${error.response.status}). Please try again.`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // prevent closing modal when loading
  const handleOverlayClick = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between divider-bottom">
          <h2>Task from Natural Language</h2>
          <button className="btn-icon" onClick={handleCloseClick} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <Error message={error} />}
          
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Generating your task... Please wait.
            </div>
          )}
          
          <div className="form-group">
            <label className="label">Describe your task</label>
            <textarea 
              className="natural-language-input" 
              value={naturalLanguage} 
              onChange={(e) => setNaturalLanguage(e.target.value)} 
              required 
              autoFocus
              rows={4}
              disabled={loading}
              placeholder="e.g., Review the quarterly report and prepare presentation slides by Friday"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCloseClick} disabled={loading}>
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