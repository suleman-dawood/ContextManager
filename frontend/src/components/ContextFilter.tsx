import type { Context } from '../types';
import '../styles/ContextFilter.css';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface ContextFilterProps {
  contexts: Context[];
  selectedContext: string | null;
  onSelectContext: (contextId: string | null) => void;
}

export function ContextFilter({
  contexts,
  selectedContext,
  onSelectContext
}: ContextFilterProps) {

  const navigate = useNavigate();

  return (
    <div className="context-filter-container">
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
            onClick={() => onSelectContext(context.id)}
          >
            {context.name}
          </button>
        ))}
      </div>
      <button className="filter-btn-icon" onClick={() => navigate('/contexts')}><Plus size={18} /></button>
    </div>
  );
}

