import { Clock, Calendar, Trash2 } from 'lucide-react';
import type { Task } from '../types';
import { Priority, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

/**
 * Individual task card component showing task details and actions
 */
export const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
  // Get priority display
  const getPriorityBadge = () => {
    const badges = {
      [Priority.High]: { text: 'High', class: 'priority-high' },
      [Priority.Medium]: { text: 'Med', class: 'priority-medium' },
      [Priority.Low]: { text: 'Low', class: 'priority-low' }
    };
    const badge = badges[task.priority];
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  // Format due date
  const formatDueDate = (date?: string) => {
    if (!date) return null;
    const dueDate = new Date(date);
    const now = new Date();
    const isOverdue = dueDate < now && task.status !== TaskStatus.Completed;
    const formatted = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return (
      <span className={isOverdue ? 'text-danger' : ''}>
        <Calendar size={14} /> {formatted}
      </span>
    );
  };

  return (
    <div className="task-card" style={{ borderLeft: `4px solid ${task.contextColor}` }}>
      <div className="task-header">
        <div className="task-title-row">
          <input
            type="checkbox"
            checked={task.status === TaskStatus.Completed}
            onChange={(e) => 
              onStatusChange(task.id, e.target.checked ? TaskStatus.Completed : TaskStatus.Todo)
            }
          />
          <h3 className={task.status === TaskStatus.Completed ? 'completed' : ''}>
            {task.title}
          </h3>
          {getPriorityBadge()}
        </div>
        <button className="btn-icon" onClick={() => onDelete(task.id)} title="Delete task">
          <Trash2 size={18} />
        </button>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span className="context-badge" style={{ background: task.contextColor }}>
          {task.contextName}
        </span>
        <span>
          <Clock size={14} /> {task.estimatedMinutes}min
        </span>
        {formatDueDate(task.dueDate)}
      </div>

      <button className="btn btn-secondary btn-small" onClick={() => onEdit(task)}>
        Edit
      </button>

      <style>{`
        .task-card {
          background: var(--white);
          border-radius: 0;
          border: 2px solid var(--black);
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--gray-medium);
        }

        .task-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .task-title-row h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: var(--black);
        }

        .task-title-row h3.completed {
          text-decoration: line-through;
          opacity: 0.5;
        }

        .task-description {
          color: var(--black);
          font-size: 14px;
          margin-bottom: 12px;
          opacity: 0.7;
        }

        .task-meta {
          display: flex;
          gap: 16px;
          align-items: center;
          font-size: 13px;
          color: var(--black);
          margin-bottom: 12px;
          opacity: 0.8;
        }

        .task-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .context-badge {
          color: var(--black);
          padding: 4px 12px;
          border-radius: 0;
          border: 2px solid var(--black);
          font-size: 12px;
          font-weight: 600;
          background: var(--white);
        }

        .badge {
          padding: 2px 8px;
          border-radius: 0;
          border: 1px solid var(--black);
          font-size: 12px;
          font-weight: 600;
          background: var(--white);
        }

        .btn-icon {
          background: none;
          border: 2px solid var(--black);
          border-radius: 0;
          color: var(--black);
          cursor: pointer;
          padding: 4px 8px;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: var(--accent-orange);
          color: var(--white);
        }

        .btn-small {
          padding: 6px 12px;
          font-size: 12px;
        }

        .text-danger {
          color: var(--accent-orange);
        }
      `}</style>
    </div>
  );
};

