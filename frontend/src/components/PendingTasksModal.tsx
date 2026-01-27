import { X, Trash2, Clock, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { tasksApi, sessionPlanApi } from '../services/api';
import { formatLocalDate } from '../utils/dateUtils';
import type { Task } from '../types';
import { Loading } from './Loading';
import { Error } from './Error';
import '../styles/CreateTaskModal.css';

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
      console.log('📥 Loaded all tasks:', allTasks.length, 'tasks');
      
      // Get all task IDs that are already in ANY session plan (to match backend logic)
      // Use a large date range to effectively capture all session plans
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      const sessionPlans = await sessionPlanApi.getSessionPlansInRange(
        formatLocalDate(oneYearAgo),
        formatLocalDate(oneYearFromNow)
      );
      console.log('📅 Loaded session plans:', sessionPlans.length);
      
      const assignedTaskIds = new Set(
        sessionPlans.flatMap(plan => plan.items.map(item => item.task.id))
      );
      console.log('🔒 Tasks assigned to session plans:', assignedTaskIds.size);
      
      // Filter out completed tasks and tasks already in session plans
      // Also filter out tasks with past due dates (to match backend logic)
      const now = new Date();
      const pending = allTasks.filter(t => {
        const isCompleted = t.status === 2;
        const isAssigned = assignedTaskIds.has(t.id);
        const isOverdue = t.dueDate && new Date(t.dueDate) < now;
        return !isCompleted && !isAssigned && !isOverdue;
      });
      
      console.log('✅ Pending tasks after filtering:', pending.length);
      console.log('📋 Pending tasks:', pending.map(t => ({ id: t.id, title: t.title, isRecurringInstance: t.isRecurringInstance })));
      
      setTasks(pending);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error loading pending tasks:', err);
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(taskId: string) {
    const taskToDelete = tasks.find(t => t.id === taskId);
    
    if (taskToDelete?.isRecurringInstance) {
      const choice = confirm(
        'This is a recurring task instance. Click OK to delete only this instance, or Cancel to keep it.'
      );
      
      if (!choice) {
        return;
      }
      
      try {
        setDeletingId(taskId);
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '80vh' }}>
        <div className="modal-header flex-between divider-bottom">
          <h2>Remaining Tasks</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1.5rem' }}>
          {loading && <Loading message="Loading tasks..." />}

          {error && <Error message={error} />}

          {!loading && !error && tasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <p>No remaining tasks. All tasks are either completed or already in a session plan.</p>
            </div>
          )}

          {!loading && !error && tasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    border: '2px solid #000',
                    borderLeft: `4px solid ${task.contextColor}`,
                    background: '#fff'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p style={{ margin: '0 0 0.75rem 0', color: '#666', fontSize: '0.9rem' }}>
                        {task.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem',
                        background: task.contextColor,
                        color: '#000',
                        fontWeight: '600',
                        border: '1px solid #000'
                      }}>
                        {task.contextName}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} /> {task.estimatedMinutes}min
                      </span>
                      <span className={`badge priority-${['low', 'medium', 'high'][task.priority]}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                      <span className={`badge status-${['todo', 'inprogress', 'completed'][task.status]}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      {task.dueDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={14} /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-icon btn-danger"
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingId === task.id}
                    title="Delete task"
                    style={{ flexShrink: 0 }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions flex-center">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
