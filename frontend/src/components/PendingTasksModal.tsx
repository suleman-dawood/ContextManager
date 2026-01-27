import { X, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { tasksApi } from '../services/api';
import type { Task } from '../types';
import '../styles/PendingTasksModal.css';

interface PendingTasksModalProps {
  onClose: () => void;
  onTaskDeleted: () => void;
}

export function PendingTasksModal({ onClose, onTaskDeleted }: PendingTasksModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingTasks();
  }, []);

  async function loadPendingTasks() {
    try {
      setLoading(true);
      const allTasks = await tasksApi.getTasks();
      const pending = allTasks.filter(t => t.status !== 2); // 2 = Completed
      setTasks(pending);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(taskId: string) {
    const taskToDelete = tasks.find(t => t.id === taskId);
    
    // Check if this is a recurring task instance
    if (taskToDelete?.isRecurringInstance) {
      const choice = confirm(
        'This is a recurring task instance. Click OK to delete only this instance, or Cancel to keep it.'
      );
      
      if (!choice) {
        return;
      }
      
      try {
        setDeletingId(taskId);
        // Delete only this instance, not the template
        await tasksApi.deleteTaskInstance(taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
        onTaskDeleted();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete task instance');
      } finally {
        setDeletingId(null);
      }
    } else {
      // Regular task deletion
      if (!confirm('Are you sure you want to delete this task?')) {
        return;
      }

      try {
        setDeletingId(taskId);
        await tasksApi.deleteTask(taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
        onTaskDeleted();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete task');
      } finally {
        setDeletingId(null);
      }
    }
  }

  function getPriorityLabel(priority: number) {
    switch (priority) {
      case 2: return 'High';
      case 1: return 'Medium';
      case 0: return 'Low';
      default: return 'Unknown';
    }
  }

  function getStatusLabel(status: number) {
    switch (status) {
      case 0: return 'Todo';
      case 1: return 'In Progress';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  }

  return (
    <div className="modal-overlay pending-tasks-modal-overlay" onClick={onClose}>
      <div className="modal-content pending-tasks-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Pending Tasks</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {loading && (
          <div className="pending-tasks-loading">
            <p>Loading tasks...</p>
          </div>
        )}

        {error && (
          <div className="pending-tasks-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="pending-tasks-empty">
            <p>No pending tasks found</p>
          </div>
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="pending-tasks-list">
            {tasks.map(task => (
              <div key={task.id} className="pending-task-item">
                <div className="pending-task-info">
                  <div className="pending-task-title">{task.title}</div>
                  {task.description && (
                    <div className="pending-task-description">{task.description}</div>
                  )}
                  <div className="pending-task-meta">
                    <span className="pending-task-context" style={{ color: task.contextColor }}>
                      {task.contextName}
                    </span>
                    <span className={`pending-task-priority priority-${task.priority}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                    <span className="pending-task-status">{getStatusLabel(task.status)}</span>
                    {task.dueDate && (
                      <span className="pending-task-due">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="pending-task-delete"
                  onClick={() => handleDelete(task.id)}
                  disabled={deletingId === task.id}
                  title="Delete task"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
