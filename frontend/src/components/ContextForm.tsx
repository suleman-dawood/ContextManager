import { useEffect, useState } from 'react';
import type { CreateContextRequest, UpdateContextRequest } from '../types';
import '../styles/ContextForm.css';


interface ContextFormProps {
    mode: 'create' | 'edit';
    initialValues?: CreateContextRequest;
    onSubmit: (contextData: CreateContextRequest | UpdateContextRequest) => Promise<void>;
    onCancel?: () => void;
    disabled?: boolean;
    submitText?: string;
}

export function ContextForm({ mode, initialValues, onSubmit, onCancel, disabled, submitText }: ContextFormProps) {
    const [name, setName] = useState(initialValues?.name || '');
    const [description, setDescription] = useState(initialValues?.description || '');
    const [color, setColor] = useState(initialValues?.color || '');
    const [icon, setIcon] = useState(initialValues?.icon || '');
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (initialValues) {
            setName(initialValues.name);
            setDescription(initialValues.description);
            setColor(initialValues.color);
            setIcon(initialValues.icon);
        }
    }, [initialValues]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setValidationError(null);

        if (!name.trim()) {
            setValidationError('Name is required');
            return;
        }
        if (!description.trim()) {
            setValidationError('Description is required');
            return;
        }
        await onSubmit({
            name: name.trim(),
            description: description.trim(),
            color: color.trim(),
            icon: icon.trim()
        });

        if (mode === 'create') {
            setName('');
            setDescription('');
            setColor('');
            setIcon('');
          }
    }

    return (
        <div className="context-form">
            <form onSubmit={handleSubmit}>
                {validationError && (
                    <div className="form-error">
                        {validationError}
                    </div>
                )}
                <div className="form-group">
                    <label className="label">Name</label>
                    <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required disabled={disabled} />
                </div>
                <div className="form-group">
                    <label className="label">Description</label>
                    <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} disabled={disabled} />
                </div>
                <div className="form-group">
                    <label className="label">Color</label>
                    <input type="text" className="input" value={color} onChange={(e) => setColor(e.target.value)} disabled={disabled} />
                </div>
                <div className="form-group">
                    <label className="label">Icon</label>
                    <input type="text" className="input" value={icon} onChange={(e) => setIcon(e.target.value)} disabled={disabled} />
                </div>
                <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={disabled}>
                    {submitText || (mode === 'create' ? 'Create Context' : 'Save Changes')}
                </button>

                {mode === 'edit' && onCancel && (
                    <button className="btn" type="button" onClick={onCancel}>
                        Cancel
                    </button>
                )}
                </div>
            </form>
        </div>
    );
}