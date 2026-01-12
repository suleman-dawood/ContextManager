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
          background: #FEE2E2;
          color: #DC2626;
          padding: 12px;
          border-radius: 8px;
          margin-top: 12px;
        }

        .suggestions-list {
          margin-top: 24px;
        }

        .suggestions-list h3 {
          font-size: 20px;
          margin-bottom: 16px;
        }

        .suggestion-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 16px;
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
          background: rgba(255, 255, 255, 0.2);
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }

        .confidence-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
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

