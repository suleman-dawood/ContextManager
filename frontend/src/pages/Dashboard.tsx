import { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { TaskList } from '../components/TaskList';
import { ContextFilter } from '../components/ContextFilter';
import { StatusFilter } from '../components/StatusFilter';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { TaskFromNaturalLanguageModal } from '../components/TaskFromNaturalLanguageModal';
import { TaskTypeSelectionModal } from '../components/TaskTypeSelectionModal';
import { RecurrantTaskForm } from '../components/RecurrantTaskForm';
import { StatsCards } from '../components/StatsCards';
import { AppHeader } from '../components/AppHeader';
import { Loading } from '../components/Loading';
import { Error as ErrorComponent } from '../components/Error';
import { useTasks } from '../hooks/useTasks';
import { useContexts } from '../hooks/useContexts';
import { useSuggestions } from '../hooks/useSuggestions';
import { useRecurringTasks } from '../hooks/useRecurringTask';
import type { Task, CreateTaskRequest, UpdateTaskRequest, CreateRecurringTaskRequest, RecurringTask } from '../types';
import { TaskStatus } from '../types';
import '../styles/Dashboard.css';

export function Dashboard() {
  const { tasks, loading, error: tasksError, createTask, updateTask, deleteTask, loadTasks } = useTasks();
  const { contexts, loading: contextsLoading } = useContexts();
  const { getTaskFromNaturalLanguage } = useSuggestions();
  const { createRecurringTask, updateRecurringTask } = useRecurringTasks();
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showTaskTypeModal, setShowTaskTypeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecurringTaskForm, setShowRecurringTaskForm] = useState(false);
  const [editingRecurringTask, setEditingRecurringTask] = useState<RecurringTask | null>(null);
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
    try {
      const result = await deleteTask(taskId);
      if ('isRecurring' in result && result.isRecurring) {
        return;
      }
      await loadTasks();
    } catch (err: any) {
      console.error('Failed to delete task:', err);
    }
  }

  async function handleCreateRecurringTask(data: CreateRecurringTaskRequest) {
    await createRecurringTask(data);
    await loadTasks();
    setShowRecurringTaskForm(false);
  }

  async function handleUpdateRecurringTask(data: CreateRecurringTaskRequest) {
    if (!editingRecurringTask) return;
    await updateRecurringTask(editingRecurringTask.id, data);
    await loadTasks();
    setEditingRecurringTask(null);
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
    <div className="dashboard-page page-wrapper">
      <AppHeader />

      <div className="container">
        <button 
          className="dashboard-quick-button" 
          onClick={() => setShowTaskFromNaturalLanguageModal(true)}
          title="Quick Task (AI)"
        >
          <Sparkles size={24} />
          <span className="dashboard-quick-button-text">Quick Task</span>
        </button>
        
        <StatsCards tasks={tasks} />

        <div className="dashboard-main-content">
          <div className="dashboard-tasks-header">
            <ContextFilter
              contexts={contexts}
              selectedContext={selectedContext}
              onSelectContext={setSelectedContext}
            />
            <button
              className="btn btn-primary"
              onClick={() => setShowTaskTypeModal(true)}
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
            statusFilter={statusFilter}
            onDeleteComplete={loadTasks}
          />
        </div>
      </div>

      {showTaskFromNaturalLanguageModal && (
        <TaskFromNaturalLanguageModal
          onClose={() => setShowTaskFromNaturalLanguageModal(false)}
          onSubmit={handleTaskFromNaturalLanguage}
        />
      )}

      {showTaskTypeModal && (
        <TaskTypeSelectionModal
          onSelectSingle={() => {
            setShowTaskTypeModal(false);
            setShowCreateModal(true);
          }}
          onSelectRecurring={() => {
            setShowTaskTypeModal(false);
            setShowRecurringTaskForm(true);
          }}
          onClose={() => setShowTaskTypeModal(false)}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {showRecurringTaskForm && (
        <RecurrantTaskForm
          mode="create"
          contexts={contexts}
          onSave={handleCreateRecurringTask}
          onCancel={() => setShowRecurringTaskForm(false)}
        />
      )}

      {editingRecurringTask && (
        <RecurrantTaskForm
          mode="edit"
          template={editingRecurringTask}
          contexts={contexts}
          onSave={handleUpdateRecurringTask}
          onCancel={() => setEditingRecurringTask(null)}
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
