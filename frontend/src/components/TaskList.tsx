import { TaskCard } from './TaskCard';
import type { Task } from '../types';
import { TaskStatus } from '../types';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

/**
 * List container for displaying multiple task cards
 */
export const TaskList = ({ tasks, onEdit, onDelete, onStatusChange }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Create your first task to get started!</p>
      </div>
    );
  }

  // Group tasks by status for better organization
  const todoTasks = tasks.filter(t => t.status === TaskStatus.Todo);
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.InProgress);
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed);

  return (
    <div className="task-list">
      {inProgressTasks.length > 0 && (
        <div className="task-section">
          <h3>In Progress ({inProgressTasks.length})</h3>
          {inProgressTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}

      {todoTasks.length > 0 && (
        <div className="task-section">
          <h3>To Do ({todoTasks.length})</h3>
          {todoTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="task-section">
          <h3>Completed ({completedTasks.length})</h3>
          {completedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}

      <style>{`
        .task-list {
          margin-top: 24px;
        }

        .task-section {
          margin-bottom: 32px;
        }

        .task-section h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--black);
          padding-bottom: 8px;
          border-bottom: 2px solid var(--black);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--black);
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

