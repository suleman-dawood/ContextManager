import { TaskStatus, Priority } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SessionPlanItem } from '../types';
import { Clock1, Zap, GripVertical, Calendar } from 'lucide-react';
import '../styles/ScheduleView.css';

interface SortableTaskItemProps {
  item: SessionPlanItem;
  isFirstInGroup: boolean;
  contextName: string;
  contextColor: string;
  onRemove: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function SortableTaskItem({ item, isFirstInGroup, contextName, contextColor, onRemove, onStatusChange }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityBadge = () => {
    const badges = {
      [Priority.High]: { text: 'High', class: 'priority-high' },
      [Priority.Medium]: { text: 'Med', class: 'priority-medium' },
      [Priority.Low]: { text: 'Low', class: 'priority-low' }
    };
    const badge = badges[item.task.priority];
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const formatDueDate = (date?: string) => {
    if (!date) return null;
    const dueDate = new Date(date);
    const now = new Date();
    const isOverdue = dueDate < now && item.task.status !== TaskStatus.Completed;
    const formatted = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const className = isOverdue ? 'due-date-text due-date-overdue' : 'due-date-text due-date-normal';
    return (
      <span className={className}>
        <Calendar size={14} /> {formatted}
      </span>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`schedule-task-item ${isFirstInGroup ? 'first-in-group' : ''}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        <GripVertical size={20} className="drag-handle-icon" />
      </div>
      
      <div className="task-content">
        {isFirstInGroup && (
          <div className="context-header" style={{ borderLeftColor: contextColor }}>
            <span className="context-badge context-badge-dynamic" style={{ backgroundColor: contextColor, color: '#000000' }}>
              {contextName}
            </span>
          </div>
        )}
        
        <div className="task-details">
          <div className="task-header-row">
            <div>
              <div className="task-title-row">
                <input
                  type="checkbox"
                  checked={item.task.status === TaskStatus.Completed}
                  onChange={(e) => {
                    e.stopPropagation();
                    onStatusChange(item.task.id, e.target.checked ? TaskStatus.Completed : TaskStatus.Todo);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <h4 className={item.task.status === TaskStatus.Completed ? 'task-title-completed' : 'task-title-normal'}>
                  {item.task.title}
                  {item.task.status === TaskStatus.Completed && (
                    <span className="completed-badge">
                      ✓ Completed
                    </span>
                  )}
                </h4>
              </div>
              {item.startTime && item.endTime && (
                <span className="task-time-range">
                  {item.startTime} - {item.endTime}
                </span>
              )}
            </div>
            <button 
              className="btn-remove-task" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(item.task.id);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              title="Remove from plan"
              type="button"
            >
              ×
            </button>
          </div>
          {item.task.description && (
            <p className="task-description">{item.task.description}</p>
          )}
          
          <div className="task-meta">
            {getPriorityBadge()}
            <span className="time-estimate">
              <Clock1 size={14} />
              {item.task.estimatedMinutes} min
            </span>
            {formatDueDate(item.task.dueDate)}
            {item.reasoning && (
              <span className="ai-reasoning">
                <Zap size={14} />
                {item.reasoning}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

