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
          gap: 0;
          border-bottom: 2px solid var(--black);
          margin-bottom: 24px;
          overflow-x: auto;
        }

        .filter-btn {
          background: var(--white);
          border: none;
          border-right: 2px solid var(--black);
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          color: var(--black);
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          white-space: nowrap;
          border-radius: 0;
        }

        .filter-btn:last-child {
          border-right: none;
        }

        .filter-btn:hover {
          background: var(--gray-light);
        }

        .filter-btn.active {
          background: var(--accent-yellow);
          color: var(--black);
          border-bottom-color: var(--black);
        }
      `}</style>
    </div>
  );
};

