import type { Context } from '../types';
import '../styles/ContextFilter.css';

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
            borderBottomColor: selectedContext === context.id ? context.color : undefined
          }}
          onClick={() => onSelectContext(context.id)}
        >
          {context.name}
        </button>
      ))}
    </div>
  );
};

