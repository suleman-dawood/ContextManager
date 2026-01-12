import type { Context } from '../types';

interface ContextFilterProps {
  contexts: Context[];
  selectedContext: string | null;
  onSelectContext: (contextId: string | null) => void;
}

/**
 * Filter tabs to switch between different mental contexts
 */
export const ContextFilter = ({
  contexts,
  selectedContext,
  onSelectContext
}: ContextFilterProps) => {
  return (
    <div className="context-filter">
      <button
        className={`filter-btn ${selectedContext === null ? 'active' : ''}`}
        onClick={() => onSelectContext(null)}
      >
        All
      </button>
      {contexts.map(context => (
        <button
          key={context.id}
          className={`filter-btn ${selectedContext === context.id ? 'active' : ''}`}
          style={{
            borderBottom: selectedContext === context.id ? `3px solid ${context.color}` : 'none'
          }}
          onClick={() => onSelectContext(context.id)}
        >
          {context.name}
        </button>
      ))}

      <style>{`
        .context-filter {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--gray-200);
          margin-bottom: 24px;
          overflow-x: auto;
        }

        .filter-btn {
          background: none;
          border: none;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-600);
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .filter-btn:hover {
          color: var(--gray-900);
        }

        .filter-btn.active {
          color: var(--gray-900);
        }
      `}</style>
    </div>
  );
};

