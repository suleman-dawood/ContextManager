import {
    Book,
    Brain,
    Calendar,
    Code,
    Clipboard,
    Lightbulb,
    Palette,
    Pencil,
    Target,
    Users,
    type LucideIcon
} from 'lucide-react';
import type { Context } from '../types';
import '../styles/Contexts.css';

interface ContextListProps {
    contexts: Context[];
    onEdit: (context: Context) => void;
    onDelete: (contextId: string) => Promise<void>;
    disableDelete: boolean;
}

// Map icon string values to their corresponding Lucide React icon components
const iconMap: Record<string, LucideIcon> = {
    brain: Brain,
    users: Users,
    clipboard: Clipboard,
    palette: Palette,
    book: Book,
    calendar: Calendar,
    code: Code,
    pencil: Pencil,
    lightbulb: Lightbulb,
    target: Target
};

export function ContextList({ contexts, onEdit, onDelete, disableDelete }: ContextListProps) {

    async function handleDelete(contextId: string) {
        const confirm = window.confirm('Are you sure you want to delete this context?');
        if (confirm) {
            await onDelete(contextId);
        }
        return;
    }

    // Helper function to render the icon component based on the icon string
    function renderIcon(iconName: string) {
        const IconComponent = iconMap[iconName];
        if (IconComponent) {
            return <IconComponent size={20} />;
        }
        // Fallback if icon name doesn't match any known icon
        return <span>{iconName}</span>;
    }

    return (
        <div className="context-list">
            {contexts.map(context => (
                <div key={context.id} className="context-row">
                    <div className="context-list-header">
                        <div className="context-name">{context.name}</div>
                        <div className="context-meta">
                            <div className="context-color" style={{ backgroundColor: context.color }}></div>
                            <div className="context-icon">{renderIcon(context.icon)}</div>
                        </div>
                    </div>
                    <div className="context-description">{context.description}</div>
                    <div className="context-actions">
                        <button className="btn btn-secondary btn-small" onClick={() => onEdit(context)}>Edit</button>
                        <button className="btn btn-secondary btn-small" onClick={() => handleDelete(context.id)} disabled={disableDelete}>Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
}