import { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { TaskList } from '../components/TaskList';
import { ContextFilter } from '../components/ContextFilter';
import { StatusFilter } from '../components/StatusFilter';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { TaskFromNaturalLanguageModal } from '../components/TaskFromNaturalLanguageModal'
import { StatsCards } from '../components/StatsCards';
import { AppHeader } from '../components/AppHeader';
import { Loading } from '../components/Loading';
import { Error as ErrorComponent } from '../components/Error';
import { useTasks } from '../hooks/useTasks';
import { useContexts } from '../hooks/useContexts';
import { useSuggestions } from '../hooks/useSuggestions';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { TaskStatus } from '../types';
import '../styles/Dashboard.css';

export function Dashboard() {
  const { tasks, loading, error: tasksError, createTask, updateTask, deleteTask } = useTasks();
  const { contexts, loading: contextsLoading } = useContexts();
  const { getTaskFromNaturalLanguage } = useSuggestions();
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskFromNaturalLanguageModal, setShowTaskFromNaturalLanguageModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    return selectedContext
      ? tasks.filter(t => t.contextId === selectedContext)
      : tasks;
  }, [tasks, selectedContext]);

  async function handleCreateTask(taskData: CreateTaskRequest) {
    await createTask(taskData);
  }

  async function handleTaskFromNaturalLanguage(naturalLanguage: string) {
    try {
      const task = await getTaskFromNaturalLanguage({ naturalLanguage: naturalLanguage });
      if (!task) {
        throw new Error('Failed to generate task. Please try again.');
      }
      await createTask({
        contextId: task.contextId,
        title: task.title,
        description: task.description,
        estimatedMinutes: task.estimatedMinutes,
        priority: task.priority,
        dueDate: task.dueDate ?? undefined
      });
    } catch (error: any) {
      throw error;
    }
  }

  async function handleUpdateTask(taskId: string, updates: UpdateTaskRequest) {
    await updateTask(taskId, updates);
    setEditingTask(null);
  }

  async function handleDeleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
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
    }

    await handleUpdateTask(taskId, updates);
  };

  if (loading || contextsLoading) {
    return <Loading fullPage message="Loading tasks..." />;
  }

  if (tasksError) {
    return <ErrorComponent fullPage message={tasksError} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="dashboard page-wrapper">
      <AppHeader />

      <div className="container">
        <button 
          className="quick-button" 
          onClick={() => setShowTaskFromNaturalLanguageModal(true)}
          title="Quick Task (AI)"
        >
          <Sparkles size={24} />
          <span className="quick-button-text">Quick Task</span>
        </button>
        
        <StatsCards tasks={tasks} />

        <div className="main-content">
          <div className="tasks-header">
            <ContextFilter
              contexts={contexts}
              selectedContext={selectedContext}
              onSelectContext={setSelectedContext}
            />
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Task
            </button>
          </div>

          <StatusFilter
            selectedStatus={statusFilter}
            onSelectStatus={setStatusFilter}
          />

          <TaskList
            tasks={filteredTasks}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      {showTaskFromNaturalLanguageModal && (
        <TaskFromNaturalLanguageModal
          onClose={() => setShowTaskFromNaturalLanguageModal(false)}
          onSubmit={handleTaskFromNaturalLanguage}
        />
      )}

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
