import { useState } from 'react';
import { Edit2, Trash2, Calendar, Clock, Repeat, MoreVertical } from 'lucide-react';
import type { RecurringTask } from '../types';
import { Priority } from '../types';
import '../styles/TaskCard.css';

interface RecurringTaskListProps {
  recurringTasks: RecurringTask[];
  onEdit: (recurringTask: RecurringTask) => void;
  onDelete: (id: string) => void;
}

export function RecurringTaskList({ recurringTasks, onEdit, onDelete }: RecurringTaskListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  function getPriorityBadge(priority: Priority) {
    const badges = {
      [Priority.High]: { text: 'High', class: 'priority-high' },
      [Priority.Medium]: { text: 'Med', class: 'priority-medium' },
      [Priority.Low]: { text: 'Low', class: 'priority-low' }
    };
    const badge = badges[priority];
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete the recurring task "${title}"? This will delete all future instances.`)) {
      return;
    }

    try {
      setDeletingId(id);
      await onDelete(id);
    } catch (error) {
      console.error('Failed to delete recurring task:', error);
      alert('Failed to delete recurring task. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  if (recurringTasks.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '2rem', textAlign: 'center' }}>
        <Repeat size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <p style={{ color: '#666' }}>No recurring tasks yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {recurringTasks.map((task) => (
        <div 
          key={task.id} 
          className="task-card"
          style={{ borderLeft: `4px solid ${task.contextColor}` }}
        >
          <div className="task-header">
            <div className="task-title-row">
              <Repeat size={18} style={{ color: task.contextColor }} />
              <h3>{task.title}</h3>
            </div>
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-footer">
            <div className="task-meta">
              <span 
                className="context-badge" 
                style={{ backgroundColor: task.contextColor, color: '#000000' }}
              >
                {task.contextName}
              </span>
              <span>
                <Calendar size={14} /> {task.recurrencePattern}
              </span>
              <span>
                <Clock size={14} /> {task.estimatedMinutes}min
              </span>
              {getPriorityBadge(task.priority)}
              <span className="badge" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                {task.instanceCount} instances
              </span>
            </div>
            <div className="task-actions">
              <button 
                className="btn btn-icon" 
                onClick={() => onEdit(task)} 
                title="Edit Recurring Task"
              >
                <Edit2 size={16} />
              </button>
              <button 
                className="btn btn-icon btn-danger" 
                onClick={() => handleDelete(task.id, task.title)}
                disabled={deletingId === task.id}
                title="Delete Recurring Task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Mobile view */}
          <div className="task-card-row-1">
            <Repeat size={18} style={{ color: task.contextColor }} />
            <h3>{task.title}</h3>
            <div className="task-dropdown">
              <button 
                className="task-dropdown-btn" 
                onClick={() => setOpenDropdown(openDropdown === task.id ? null : task.id)}
                title="Actions"
              >
                <MoreVertical size={20} />
              </button>
              {openDropdown === task.id && (
                <div className="task-dropdown-menu">
                  <button 
                    className="task-dropdown-item" 
                    onClick={() => {
                      onEdit(task);
                      setOpenDropdown(null);
                    }}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button 
                    className="task-dropdown-item task-dropdown-item-danger" 
                    onClick={() => {
                      setOpenDropdown(null);
                      handleDelete(task.id, task.title);
                    }}
                    disabled={deletingId === task.id}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {task.description && (
            <div className="task-card-description">
              <p className="task-description">{task.description}</p>
            </div>
          )}

          <div className="task-card-row-2">
            <span 
              className="context-badge" 
              style={{ backgroundColor: task.contextColor, color: '#000000' }}
            >
              {task.contextName}
            </span>
            <span>
              <Calendar size={12} /> {task.recurrencePattern}
            </span>
            <span>
              <Clock size={12} /> {task.estimatedMinutes}min
            </span>
            {getPriorityBadge(task.priority)}
            <span className="badge" style={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontSize: '0.75rem' }}>
              {task.instanceCount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
