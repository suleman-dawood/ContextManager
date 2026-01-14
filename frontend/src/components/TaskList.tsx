import { TaskCard } from './TaskCard';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import '../styles/TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export const TaskList = ({ tasks, onEdit, onDelete, onStatusChange }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p className="text-secondary">No tasks yet. Create your first task to get started!</p>
      </div>
    );
  }

  const todoTasks = tasks.filter(t => t.status === TaskStatus.Todo);
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.InProgress);
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed);

  return (
    <div className="task-list">
      {inProgressTasks.length > 0 && (
        <div className="task-section">
          <h3 className="heading-tertiary divider-bottom">In Progress ({inProgressTasks.length})</h3>
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
          <h3 className="heading-tertiary divider-bottom">To Do ({todoTasks.length})</h3>
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
          <h3 className="heading-tertiary divider-bottom">Completed ({completedTasks.length})</h3>
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
    </div>
  );
};

