import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  Context,
  TaskSuggestion,
  ContextDistribution,
  CompletionRate
} from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized - redirect to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================================
// Authentication API
// ========================================

export const authApi = {
  /**
   * Register a new user account
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login with existing credentials
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }
};

// ========================================
// Tasks API
// ========================================

export const tasksApi = {
  /**
   * Get all tasks with optional filters
   */
  getTasks: async (contextId?: string, status?: number): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (contextId) params.append('contextId', contextId);
    if (status !== undefined) params.append('status', status.toString());
    
    const response = await api.get<Task[]>(`/tasks?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single task by ID
   */
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Create a new task
   */
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  /**
   * Update an existing task
   */
  updateTask: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  /**
   * Delete a task
   */
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  }
};

// ========================================
// Contexts API
// ========================================

export const contextsApi = {
  /**
   * Get all available contexts
   */
  getContexts: async (): Promise<Context[]> => {
    const response = await api.get<Context[]>('/contexts');
    return response.data;
  }
};

// ========================================
// AI Suggestions API (Star Feature!)
// ========================================

export const suggestionsApi = {
  /**
   * Get AI-powered task suggestions for a context
   */
  getSuggestions: async (contextId: string): Promise<TaskSuggestion[]> => {
    const response = await api.get<TaskSuggestion[]>(`/suggestions?contextId=${contextId}`);
    return response.data;
  },

  /**
   * Provide feedback on a suggestion
   */
  provideFeedback: async (suggestionId: string, accepted: boolean): Promise<void> => {
    await api.post(`/suggestions/${suggestionId}/feedback`, { accepted });
  }
};

// ========================================
// Analytics API
// ========================================

export const analyticsApi = {
  /**
   * Get task distribution across contexts
   */
  getContextDistribution: async (): Promise<ContextDistribution[]> => {
    const response = await api.get<ContextDistribution[]>('/analytics/context-distribution');
    return response.data;
  },

  /**
   * Get completion rate over last 7 days
   */
  getCompletionRate: async (): Promise<CompletionRate[]> => {
    const response = await api.get<CompletionRate[]>('/analytics/completion-rate');
    return response.data;
  }
};

export default api;

