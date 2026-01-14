import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { TaskList } from '../components/TaskList';
import { ContextFilter } from '../components/ContextFilter';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { StatsCards } from '../components/StatsCards';
import { AppHeader } from '../components/AppHeader';
import { useTasks } from '../hooks/useTasks';
import { useContexts } from '../hooks/useContexts';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { TaskStatus } from '../types';
import '../styles/Dashboard.css';

export function Dashboard() {
  const { tasks, loading, error: tasksError, createTask, updateTask, deleteTask } = useTasks();
  const { contexts, loading: contextsLoading } = useContexts();

  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    return selectedContext
      ? tasks.filter(t => t.contextId === selectedContext)
      : tasks;
  }, [tasks, selectedContext]);

  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    await createTask(taskData);
  };

  const handleUpdateTask = async (taskId: string, updates: UpdateTaskRequest) => {
    await updateTask(taskId, updates);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updates: UpdateTaskRequest = {
      contextId: task.contextId,
      title: task.title,
      description: task.description,
      estimatedMinutes: task.estimatedMinutes,
      priority: task.priority,
      status,
      dueDate: task.dueDate
    };

    await handleUpdateTask(taskId, updates);
  };

  if (loading || contextsLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (tasksError) {
    return <div className="error-message">{tasksError}</div>;
  }

  return (
    <div className="dashboard page-wrapper">
      <AppHeader />

      <div className="container">
        <StatsCards tasks={tasks} />

        <div className="main-content content-section">
          <div className="content-header flex-between divider-bottom">
            <h2 className="heading-secondary">Your Tasks</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> New Task
            </button>
          </div>

          <ContextFilter
            contexts={contexts}
            selectedContext={selectedContext}
            onSelectContext={setSelectedContext}
          />

          <TaskList
            tasks={filteredTasks}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          contexts={contexts}
          onClose={() => setEditingTask(null)}
          onSubmit={handleUpdateTask}
        />
      )}
    </div>
  );
}
