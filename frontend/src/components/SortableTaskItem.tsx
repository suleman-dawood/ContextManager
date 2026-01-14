import { TaskStatus } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SessionPlanItem } from '../types';
import { Clock, Zap, GripVertical } from 'lucide-react';
import '../styles/ScheduleView.css';

interface SortableTaskItemProps {
  item: SessionPlanItem;
  isFirstInGroup: boolean;
  contextName: string;
  contextColor: string;
  onRemove: (taskId: string) => void;
}

export function SortableTaskItem({ item, isFirstInGroup, contextName, contextColor, onRemove }: SortableTaskItemProps) {
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
              <h4 className={item.task.status === TaskStatus.Completed ? 'task-title-completed' : 'task-title-normal'}>
                {item.task.title}
                {item.task.status === TaskStatus.Completed && (
                  <span className="completed-badge">
                    ✓ Completed
                  </span>
                )}
              </h4>
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
            <span className="time-estimate">
              <Clock size={14} />
              {item.task.estimatedMinutes} min
            </span>
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

