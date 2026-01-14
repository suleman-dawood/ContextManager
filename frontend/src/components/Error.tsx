import '../styles/Error.css';

interface ErrorProps {
  message: string;
  fullPage?: boolean;
  onRetry?: () => void;
}

export function Error({ message, fullPage = false, onRetry }: ErrorProps) {
  const className = fullPage ? 'error error-full-page' : 'error error-inline';
  
  return (
    <div className={className}>
      <div className="error-content">
        <span className="error-icon">⚠</span>
        <span className="error-message">{message}</span>
      </div>
      {onRetry && (
        <button className="btn btn-secondary btn-small" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

