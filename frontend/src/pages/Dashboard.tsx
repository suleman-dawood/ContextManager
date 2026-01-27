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
import { EditRecurringTaskModal } from '../components/EditRecurringTaskModal';
import { RecurringTaskList } from '../components/RecurringTaskList';
import { StatsCards } from '../components/StatsCards';
import { AppHeader } from '../components/AppHeader';
import { Loading } from '../components/Loading';
import { Error as ErrorComponent } from '../components/Error';
import { useTasks } from '../hooks/useTasks';
import { useContexts } from '../hooks/useContexts';
import { useSuggestions } from '../hooks/useSuggestions';
import { useRecurringTasks } from '../hooks/useRecurringTask';
import type { Task, CreateTaskRequest, UpdateTaskRequest, CreateRecurringTaskRequest, UpdateRecurringTaskRequest, RecurringTask } from '../types';
import { TaskStatus } from '../types';
import '../styles/Dashboard.css';

export function Dashboard() {
  const { tasks, loading, error: tasksError, createTask, updateTask, deleteTask, loadTasks } = useTasks();
  const { contexts, loading: contextsLoading } = useContexts();
  const { getTaskFromNaturalLanguage } = useSuggestions();
  const { 
    recurringTasks, 
    loading: recurringLoading, 
    createRecurringTask, 
    updateRecurringTask, 
    deleteRecurringTask,
    loadRecurringTasks 
  } = useRecurringTasks();
  const [viewMode, setViewMode] = useState<'tasks' | 'recurring'>('tasks');
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
    await loadRecurringTasks();
    setShowRecurringTaskForm(false);
  }

  async function handleUpdateRecurringTask(id: string, data: UpdateRecurringTaskRequest) {
    await updateRecurringTask(id, data);
    await loadTasks();
    await loadRecurringTasks();
    setEditingRecurringTask(null);
  }

  async function handleDeleteRecurringTask(id: string) {
    try {
      await deleteRecurringTask(id);
      await loadTasks();
      await loadRecurringTasks();
    } catch (err: any) {
      console.error('Failed to delete recurring task:', err);
      throw err;
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
          <div className="dashboard-view-toggle" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e0e0e0' }}>
            <button
              className={viewMode === 'tasks' ? 'view-tab-active' : 'view-tab'}
              onClick={() => setViewMode('tasks')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: viewMode === 'tasks' ? 'bold' : 'normal',
                borderBottom: viewMode === 'tasks' ? '3px solid #4f46e5' : 'none',
                marginBottom: '-2px',
                color: viewMode === 'tasks' ? '#4f46e5' : '#666'
              }}
            >
              Tasks
            </button>
            <button
              className={viewMode === 'recurring' ? 'view-tab-active' : 'view-tab'}
              onClick={() => setViewMode('recurring')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: viewMode === 'recurring' ? 'bold' : 'normal',
                borderBottom: viewMode === 'recurring' ? '3px solid #4f46e5' : 'none',
                marginBottom: '-2px',
                color: viewMode === 'recurring' ? '#4f46e5' : '#666'
              }}
            >
              Recurring Tasks
            </button>
          </div>

          {viewMode === 'tasks' ? (
            <>
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
            </>
          ) : (
            <>
              <div className="dashboard-tasks-header">
                <div></div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowRecurringTaskForm(true)}
                >
                  Create Recurring Task
                </button>
              </div>

              {recurringLoading ? (
                <Loading message="Loading recurring tasks..." />
              ) : (
                <RecurringTaskList
                  recurringTasks={recurringTasks}
                  onEdit={setEditingRecurringTask}
                  onDelete={handleDeleteRecurringTask}
                />
              )}
            </>
          )}
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
        <EditRecurringTaskModal
          recurringTask={editingRecurringTask}
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
