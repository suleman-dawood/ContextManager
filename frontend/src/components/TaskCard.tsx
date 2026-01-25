import { Clock, Calendar, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '../types';
import { Priority, TaskStatus } from '../types';
import '../styles/TaskCard.css';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const getPriorityBadge = () => {
    const badges = {
      [Priority.High]: { text: 'High', class: 'priority-high' },
      [Priority.Medium]: { text: 'Med', class: 'priority-medium' },
      [Priority.Low]: { text: 'Low', class: 'priority-low' }
    };
    const badge = badges[task.priority];
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const formatDueDate = (date?: string) => {
    if (!date) return null;
    const dueDate = new Date(date);
    const now = new Date();
    const isOverdue = dueDate < now && task.status !== TaskStatus.Completed;
    const formatted = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const className = isOverdue ? 'due-date-text due-date-overdue' : 'due-date-text due-date-normal';
    return (
      <span className={className}>
        <Calendar size={14} /> {formatted}
      </span>
    );
  };

  const isOverdue = () => {
    if (!task.dueDate || task.status === TaskStatus.Completed) return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    return dueDate < now;
  };

  const cardClassName = isOverdue() ? 'task-card task-card-overdue' : 'task-card';

  return (
    <div className={cardClassName} style={{ borderLeft: `4px solid ${task.contextColor}` }}>
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
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-footer">
        <div className="task-meta">
          <span className="context-badge" style={{ backgroundColor: task.contextColor, color: '#000000' }}>
            {task.contextName}
          </span>
          {formatDueDate(task.dueDate)}
          <span>
            <Clock size={14} /> {task.estimatedMinutes}min
          </span>
          {getPriorityBadge()}
          <span className={`status-badge status-${TaskStatus[task.status].toLowerCase()}`}>
            {TaskStatus[task.status]}
          </span>
        </div>
        <div className="task-actions">
          <button className="btn btn-icon" onClick={() => onEdit(task)} title="Edit Task">
            <Edit2 size={16} />
          </button>
          <button className="btn btn-icon btn-danger" onClick={() => onDelete(task.id)} title="Delete Task">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="task-card-row-1">
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
        <div className="task-dropdown">
          <button 
            className="task-dropdown-btn" 
            onClick={() => setShowDropdown(!showDropdown)}
            title="Actions"
          >
            <MoreVertical size={20} />
          </button>
          {showDropdown && (
            <div className="task-dropdown-menu">
              <button 
                className="task-dropdown-item" 
                onClick={() => {
                  onEdit(task);
                  setShowDropdown(false);
                }}
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button 
                className="task-dropdown-item task-dropdown-item-danger" 
                onClick={() => {
                  onDelete(task.id);
                  setShowDropdown(false);
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="task-card-row-2">
        <span className="context-badge" style={{ backgroundColor: task.contextColor, color: '#000000' }}>
          {task.contextName}
        </span>
        {formatDueDate(task.dueDate)}
        <span>
          <Clock size={12} /> {task.estimatedMinutes}min
        </span>
        {getPriorityBadge()}
        <span className={`status-badge status-${TaskStatus[task.status].toLowerCase()}`}>
          {TaskStatus[task.status]}
        </span>
      </div>
    </div>
  );
};

