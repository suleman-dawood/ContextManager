import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { Error } from './Error';
import type { Context, RecurringTask, CreateRecurringTaskRequest } from '../types';
import { Priority, RecurrenceType } from '../types';
import '../styles/RecurrantTaskForm.css';

const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type FormData = CreateRecurringTaskRequest;

interface RecurrantTaskFormProps {
  mode: 'create' | 'edit';
  template?: RecurringTask;
  contexts: Context[];
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

function toDateInputValue(isoOrDate: string | null): string {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function buildPreview(form: FormData): string {
  if (!form.recurrenceStartDate) return 'Please select a start date';

  const start = new Date(form.recurrenceStartDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  const end = form.recurrenceEndDate
    ? new Date(form.recurrenceEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  let pattern = '';
  if (form.recurrenceType === RecurrenceType.Daily) {
    pattern = 'daily';
  } else if (form.recurrenceType === RecurrenceType.Weekly) {
    pattern = 'weekly';
  } else if (form.recurrenceType === RecurrenceType.Biweekly) {
    pattern = 'every 2 weeks';
  } else if (form.recurrenceType === RecurrenceType.Monthly) {
    pattern = 'monthly';
  } else if (form.recurrenceType === RecurrenceType.Custom) {
    if (form.recurrenceDays && form.recurrenceDays.length > 0) {
      const dayNames = form.recurrenceDays.map(d => {
        const dayMap: Record<string, string> = {
          'Mon': 'Monday',
          'Tue': 'Tuesday',
          'Wed': 'Wednesday',
          'Thu': 'Thursday',
          'Fri': 'Friday',
          'Sat': 'Saturday',
          'Sun': 'Sunday'
        };
        return dayMap[d] || d;
      });
      if (dayNames.length === 1) {
        pattern = `every ${dayNames[0]}`;
      } else if (dayNames.length === 2) {
        pattern = `every ${dayNames[0]} and ${dayNames[1]}`;
      } else {
        const last = dayNames.pop();
        pattern = `every ${dayNames.join(', ')}, and ${last}`;
      }
    } else {
      pattern = 'on selected days';
    }
  }

  let text = `This task will repeat ${pattern} starting ${start}`;
  if (end) {
    text += ` until ${end}`;
  }
  return text;
}

const defaultFormData: FormData = {
  contextId: '00000000-0000-0000-0000-000000000000', // AI will determine context
  title: '',
  description: null,
  estimatedMinutes: 30,
  priority: Priority.Medium,
  recurrenceType: RecurrenceType.Daily,
  recurrenceDays: null,
  recurrenceStartDate: toDateInputValue(new Date().toISOString()),
  recurrenceEndDate: null
};

export function RecurrantTaskForm({
  mode,
  template,
  contexts,
  onSave,
  onCancel
}: RecurrantTaskFormProps) {
  const [form, setForm] = useState<FormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && template) {
      setForm({
        contextId: template.contextId,
        title: template.title,
        description: template.description ?? null,
        estimatedMinutes: template.estimatedMinutes,
        priority: template.priority,
        recurrenceType: template.recurrenceType,
        recurrenceDays: template.recurrenceDays ?? null,
        recurrenceStartDate: toDateInputValue(template.recurrenceStartDate),
        recurrenceEndDate: template.recurrenceEndDate ? toDateInputValue(template.recurrenceEndDate) : null
      });
    } else {
      setForm({ ...defaultFormData, recurrenceStartDate: toDateInputValue(new Date().toISOString()) });
    }
  }, [mode, template]);

  const update = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  const toggleRecurrenceDay = (day: string) => {
    const current = form.recurrenceDays ?? [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    update('recurrenceDays', next.length ? next : null);
  };

  const preview = useMemo(() => buildPreview(form), [form]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (!form.title.trim()) {
      setValidationError('Title is required');
      return;
    }
    if (form.recurrenceType === RecurrenceType.Custom && (!form.recurrenceDays || form.recurrenceDays.length === 0)) {
      setValidationError('Select at least one day for custom recurrence');
      return;
    }
    if (form.recurrenceEndDate) {
      const startDate = new Date(form.recurrenceStartDate);
      const endDate = new Date(form.recurrenceEndDate);
      if (endDate < startDate) {
        setValidationError('End date must be after start date');
        return;
      }
    }

    setLoading(true);
    try {
      // Convert date strings (YYYY-MM-DD) to ISO strings for the API
      const startDateISO = form.recurrenceStartDate 
        ? new Date(form.recurrenceStartDate + 'T00:00:00').toISOString()
        : new Date().toISOString();
      
      const endDateISO = form.recurrenceEndDate?.trim()
        ? new Date(form.recurrenceEndDate + 'T00:00:00').toISOString()
        : null;

      const payload: FormData = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || null,
        recurrenceDays: form.recurrenceType === RecurrenceType.Custom ? (form.recurrenceDays ?? []) : null,
        recurrenceStartDate: startDateISO,
        recurrenceEndDate: endDateISO
      };
      await onSave(payload);
      onCancel();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      setValidationError(msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const isCustom = form.recurrenceType === RecurrenceType.Custom;

  return (
    <div className="modal-overlay recurring-task-form-overlay" onClick={onCancel}>
      <div className="modal recurring-task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between divider-bottom">
          <h2>{mode === 'create' ? 'Create Recurring Task' : 'Edit Recurring Task'}</h2>
          <button type="button" className="btn-icon" onClick={onCancel} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={form.description ?? ''}
              onChange={(e) => update('description', e.target.value || null)}
            />
          </div>

          {mode === 'edit' && (
            <div className="form-group">
              <label className="label">Context *</label>
              <select
                className="input"
                value={form.contextId}
                onChange={(e) => update('contextId', e.target.value)}
                required
              >
                <option value="">Select context</option>
                {contexts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === 'create' && (
            <div className="form-group">
              <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                Context will be automatically determined by AI based on task title and description
              </p>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="label">Estimated time (min)</label>
              <input
                type="number"
                className="input"
                min={5}
                step={5}
                value={form.estimatedMinutes}
                onChange={(e) => update('estimatedMinutes', parseInt(e.target.value, 10) || 0)}
              />
            </div>
            <div className="form-group">
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => update('priority', parseInt(e.target.value, 10) as Priority)}
              >
                <option value={Priority.Low}>Low</option>
                <option value={Priority.Medium}>Medium</option>
                <option value={Priority.High}>High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Recurrence *</label>
            <select
              className="input"
              value={form.recurrenceType}
              onChange={(e) => update('recurrenceType', parseInt(e.target.value, 10) as RecurrenceType)}
            >
              <option value={RecurrenceType.Daily}>Daily</option>
              <option value={RecurrenceType.Weekly}>Weekly</option>
              <option value={RecurrenceType.Biweekly}>Every 2 weeks</option>
              <option value={RecurrenceType.Monthly}>Monthly</option>
              <option value={RecurrenceType.Custom}>Custom (specific days)</option>
            </select>
          </div>

          {isCustom && (
            <div className="form-group recurrence-days-group">
              <label className="label">Repeat on</label>
              <div className="recurrence-days">
                {DAY_OPTIONS.map((day) => (
                  <label key={day} className="recurrence-day-checkbox">
                    <input
                      type="checkbox"
                      checked={(form.recurrenceDays ?? []).includes(day)}
                      onChange={() => toggleRecurrenceDay(day)}
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="label">Start date *</label>
              <input
                type="date"
                className="input"
                min={new Date().toISOString().split('T')[0]}
                value={form.recurrenceStartDate}
                onChange={(e) => update('recurrenceStartDate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">End date (optional)</label>
              <input
                type="date"
                className="input"
                min={form.recurrenceStartDate || new Date().toISOString().split('T')[0]}
                value={form.recurrenceEndDate ?? ''}
                onChange={(e) => update('recurrenceEndDate', e.target.value || null)}
              />
            </div>
          </div>

          <div className="form-group recurrence-preview">
            <span className="recurrence-preview-text">{preview}</span>
          </div>

          {validationError && <Error message={validationError} />}

          <div className="modal-actions flex-center">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (mode === 'create' ? 'Creating...' : 'Saving...') : mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
