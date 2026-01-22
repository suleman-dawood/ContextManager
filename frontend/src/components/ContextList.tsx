import type { Context } from '../types';

interface ContextListProps {
    contexts: Context[];
    onEdit: (context: Context) => void;
    onDelete: (contextId: string) => Promise<void>;
    disableDelete: boolean;
}

export function ContextList({ contexts, onEdit, onDelete, disableDelete }: ContextListProps) {

    async function handleDelete(contextId: string) {
        const confirm = window.confirm('Are you sure you want to delete this context?');
        if (confirm) {
            await onDelete(contextId);
        }
        return;
    }
    return (
        <div className="context-list">
            {contexts.map(context => (
                <div key={context.id} className="context-row">
                    <div className="context-name">{context.name}</div>
                    <div className="context-description">{context.description}</div>
                    <div className="context-meta">
                        <div className="context-color" style={{ backgroundColor: context.color }}></div>
                        <div className="context-icon">{context.icon}</div>
                    </div>
                    <div className="context-actions">
                        <button className="btn btn-secondary btn-small" onClick={() => onEdit(context)}>Edit</button>
                        <button className="btn btn-secondary btn-small" onClick={() => handleDelete(context.id)} disabled={disableDelete}>Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
}