import { TaskCard } from './TaskCard';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import '../styles/TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  statusFilter?: string;
  onDeleteComplete?: () => void;
}

export const TaskList = ({ tasks, onEdit, onDelete, onStatusChange, statusFilter = 'all', onDeleteComplete }: TaskListProps) => {
  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === TaskStatus.Completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  let filteredTasks = tasks;
  
  if (statusFilter === 'todo') {
    filteredTasks = tasks.filter(t => t.status === TaskStatus.Todo);
  } else if (statusFilter === 'inprogress') {
    filteredTasks = tasks.filter(t => t.status === TaskStatus.InProgress);
  } else if (statusFilter === 'completed') {
    filteredTasks = tasks.filter(t => t.status === TaskStatus.Completed);
  } else if (statusFilter === 'overdue') {
    filteredTasks = tasks.filter(t => isOverdue(t));
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks found. {statusFilter !== 'all' ? 'Try a different filter.' : 'Create your first task to get started!'}</p>
      </div>
    );
  }

  const todoTasks = filteredTasks.filter(t => t.status === TaskStatus.Todo);
  const inProgressTasks = filteredTasks.filter(t => t.status === TaskStatus.InProgress);
  const completedTasks = filteredTasks.filter(t => t.status === TaskStatus.Completed);

  return (
    <div className="task-list">
      {inProgressTasks.length > 0 && (
        <div className="task-section">
          <h3 className="divider-bottom">In Progress ({inProgressTasks.length})</h3>
          {inProgressTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onDeleteComplete={onDeleteComplete}
            />
          ))}
        </div>
      )}

      {todoTasks.length > 0 && (
        <div className="task-section">
          <h3 className="divider-bottom">To Do ({todoTasks.length})</h3>
          {todoTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onDeleteComplete={onDeleteComplete}
            />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="task-section">
          <h3 className="divider-bottom">Completed ({completedTasks.length})</h3>
          {completedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onDeleteComplete={onDeleteComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

