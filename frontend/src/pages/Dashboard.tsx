import { useState, useEffect } from 'react';
import { Plus, LogOut, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TaskList } from '../components/TaskList';
import { ContextFilter } from '../components/ContextFilter';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { StatsCards } from '../components/StatsCards';
import { tasksApi, contextsApi } from '../services/api';
import { getCurrentUser, logout } from '../services/auth';
import type { Task, Context, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { TaskStatus } from '../types';

/**
 * Main dashboard page - the heart of the application
 */
export const Dashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate, user]);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      const [contextsData, tasksData] = await Promise.all([
        contextsApi.getContexts(),
        tasksApi.getTasks()
      ]);
      setContexts(contextsData);
      setTasks(tasksData);
    } catch (error) {
      // If 401, token might be invalid - clear and redirect
      if ((error as any).response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    const newTask = await tasksApi.createTask(taskData);
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = async (taskId: string, updates: UpdateTaskRequest) => {
    const updatedTask = await tasksApi.updateTask(taskId, updates);
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await tasksApi.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updates: UpdateTaskRequest = {
      title: task.title,
      description: task.description,
      estimatedMinutes: task.estimatedMinutes,
      priority: task.priority,
      status,
      dueDate: task.dueDate
    };

    await handleUpdateTask(taskId, updates);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter tasks based on selected context
  const filteredTasks = selectedContext
    ? tasks.filter(t => t.contextId === selectedContext)
    : tasks;

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your tasks by mental context</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/schedule')}>
            <Calendar size={18} /> Session Planner
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/analytics')}>
            Analytics
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <div className="container">
        <StatsCards tasks={tasks} />

        <div className="main-content">
          <div className="content-header">
            <h2>Your Tasks</h2>
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
          contexts={contexts}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={handleUpdateTask}
        />
      )}

      <style>{`
        .dashboard {
          min-height: 100vh;
          background: var(--white);
        }

        .dashboard-header {
          background: var(--white);
          padding: 24px;
          border-bottom: 3px solid var(--black);
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dashboard-header h1 {
          font-size: 24px;
          margin: 0 0 4px 0;
          color: var(--black);
        }

        .dashboard-header p {
          color: var(--black);
          font-size: 14px;
          margin: 0;
          opacity: 0.7;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .main-content {
          background: var(--white);
          border-radius: 0;
          border: 2px solid var(--black);
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          border-bottom: 2px solid var(--black);
          padding-bottom: 16px;
        }

        .content-header h2 {
          font-size: 20px;
          margin: 0;
          color: var(--black);
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 18px;
          color: var(--black);
        }
      `}</style>
    </div>
  );
};

