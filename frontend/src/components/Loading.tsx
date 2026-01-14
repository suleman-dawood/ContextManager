import '../styles/Loading.css';

interface LoadingProps {
  message?: string;
  fullPage?: boolean;
}

export function Loading({ message = 'Loading...', fullPage = false }: LoadingProps) {
  const className = fullPage ? 'loading loading-full-page' : 'loading loading-inline';
  
  return (
    <div className={className}>
      <div className="loading-spinner"></div>
      <span className="loading-text">{message}</span>
    </div>
  );
}

