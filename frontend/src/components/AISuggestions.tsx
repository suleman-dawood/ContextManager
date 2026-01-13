import { useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { suggestionsApi } from '../services/api';
import type { TaskSuggestion } from '../types';

interface AISuggestionsProps {
  contextId: string;
}

/**
 * AI-powered task suggestions component (STAR FEATURE!)
 * Uses Claude to intelligently recommend which tasks to work on
 */
export const AISuggestions = ({ contextId }: AISuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await suggestionsApi.getSuggestions(contextId);
      setSuggestions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  const provideFeedback = async (suggestionId: string, accepted: boolean) => {
    try {
      await suggestionsApi.provideFeedback(suggestionId, accepted);
      // Update UI to show feedback was recorded
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (err) {
      console.error('Failed to provide feedback:', err);
    }
  };

  return (
    <div className="ai-suggestions">
      <button 
        className="btn btn-primary suggestion-trigger" 
        onClick={fetchSuggestions}
        disabled={loading}
      >
        <Sparkles size={18} />
        {loading ? 'AI is thinking...' : 'Get AI Task Suggestions'}
      </button>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {suggestions.length > 0 && (
        <div className="suggestions-list">
          <h3>✨ AI Recommendations</h3>
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="suggestion-card">
              <div className="suggestion-header">
                <h4>{suggestion.taskTitle}</h4>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ width: `${suggestion.confidence * 100}%` }}
                  />
                  <span className="confidence-text">
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              <p className="reasoning">{suggestion.reasoning}</p>

              <div className="suggestion-meta">
                <span>⏱️ {suggestion.estimatedMinutes} min</span>
              </div>

              <div className="feedback-actions">
                <button 
                  className="btn btn-success btn-small"
                  onClick={() => provideFeedback(suggestion.id, true)}
                >
                  <ThumbsUp size={14} /> Helpful
                </button>
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => provideFeedback(suggestion.id, false)}
                >
                  <ThumbsDown size={14} /> Not helpful
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .ai-suggestions {
          margin: 24px 0;
        }

        .suggestion-trigger {
          width: 100%;
          justify-content: center;
        }

        .error-message {
          background: var(--white);
          color: var(--accent-orange);
          padding: 12px;
          border-radius: 0;
          border: 2px solid var(--accent-orange);
          margin-top: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .suggestions-list {
          margin-top: 24px;
        }

        .suggestions-list h3 {
          font-size: 20px;
          margin-bottom: 16px;
        }

        .suggestion-card {
          background: var(--accent-yellow);
          color: var(--black);
          padding: 20px;
          border-radius: 0;
          border: 3px solid var(--black);
          margin-bottom: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .suggestion-header {
          margin-bottom: 12px;
        }

        .suggestion-header h4 {
          font-size: 18px;
          margin: 0 0 8px 0;
        }

        .confidence-bar {
          position: relative;
          background: var(--white);
          border: 2px solid var(--black);
          height: 8px;
          border-radius: 0;
          overflow: hidden;
        }

        .confidence-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: var(--black);
          transition: width 0.3s;
        }

        .confidence-text {
          position: absolute;
          top: -20px;
          right: 0;
          font-size: 12px;
          font-weight: 600;
        }

        .reasoning {
          margin: 16px 0;
          font-size: 14px;
          line-height: 1.6;
        }

        .suggestion-meta {
          margin-bottom: 16px;
          font-size: 14px;
          opacity: 0.9;
        }

        .feedback-actions {
          display: flex;
          gap: 12px;
        }

        .btn-small {
          padding: 6px 12px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

