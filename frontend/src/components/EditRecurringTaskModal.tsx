import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { Error } from './Error';
import type { Context, RecurringTask, UpdateRecurringTaskRequest } from '../types';
import { Priority, RecurrenceType } from '../types';
import '../styles/RecurrantTaskForm.css';

const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

interface EditRecurringTaskModalProps {
  recurringTask: RecurringTask;
  contexts: Context[];
  onSave: (id: string, data: UpdateRecurringTaskRequest) => Promise<void>;
  onCancel: () => void;
}

// Helper function to convert ISO date string to date input value (YYYY-MM-DD)
function toDateInputValue(isoOrDate: string | null): string {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

// Generates a preview text showing the recurrence pattern
function buildPreview(form: UpdateRecurringTaskRequest): string {
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

export function EditRecurringTaskModal({
  recurringTask,
  contexts,
  onSave,
  onCancel
}: EditRecurringTaskModalProps) {
  const [form, setForm] = useState<UpdateRecurringTaskRequest>({
    contextId: recurringTask.contextId,
    title: recurringTask.title,
    description: recurringTask.description ?? null,
    estimatedMinutes: recurringTask.estimatedMinutes,
    priority: recurringTask.priority,
    recurrenceType: recurringTask.recurrenceType,
    recurrenceDays: recurringTask.recurrenceDays ?? null,
    recurrenceStartDate: toDateInputValue(recurringTask.recurrenceStartDate),
    recurrenceEndDate: recurringTask.recurrenceEndDate ? toDateInputValue(recurringTask.recurrenceEndDate) : null
  });
  
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Update form when recurringTask changes
  useEffect(() => {
    setForm({
      contextId: recurringTask.contextId,
      title: recurringTask.title,
      description: recurringTask.description ?? null,
      estimatedMinutes: recurringTask.estimatedMinutes,
      priority: recurringTask.priority,
      recurrenceType: recurringTask.recurrenceType,
      recurrenceDays: recurringTask.recurrenceDays ?? null,
      recurrenceStartDate: toDateInputValue(recurringTask.recurrenceStartDate),
      recurrenceEndDate: recurringTask.recurrenceEndDate ? toDateInputValue(recurringTask.recurrenceEndDate) : null
    });
  }, [recurringTask]);

  // Generic update function for form fields
  const update = <K extends keyof UpdateRecurringTaskRequest>(field: K, value: UpdateRecurringTaskRequest[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  // Toggle a specific day in the custom recurrence days
  const toggleRecurrenceDay = (day: string) => {
    const current = form.recurrenceDays ?? [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    update('recurrenceDays', next.length ? next : null);
  };

  // Preview text showing the recurrence pattern
  const preview = useMemo(() => buildPreview(form), [form]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    // Validate required fields
    if (!form.title.trim()) {
      setValidationError('Title is required');
      return;
    }
    if (!form.contextId) {
      setValidationError('Context is required');
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

      const payload: UpdateRecurringTaskRequest = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || null,
        recurrenceDays: form.recurrenceType === RecurrenceType.Custom ? (form.recurrenceDays ?? []) : null,
        recurrenceStartDate: startDateISO,
        recurrenceEndDate: endDateISO
      };
      
      await onSave(recurringTask.id, payload);
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
          <h2>Edit Recurring Task</h2>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
