import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  Context,
  CreateContextRequest,
  UpdateContextRequest,
  ContextDistribution,
  CompletionRate,
  ContextCategorizationResponse,
  CategorizeTaskRequest,
  SessionPlan,
  GenerateSessionPlanRequest,
  UpdateSessionPlanOrderRequest
} from '../types';

// axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// intercepts every API request and runs before it
api.interceptors.request.use(function(config) {
  // skip authentican header for login/register endpoints
  if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
    return config;
  }
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// runs after every API response
api.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    if (error.response?.status === 401) { //login error
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    // rethrowing the error for components
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async function(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async function(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }
};

export const tasksApi = {
  getTasks: async function(contextId?: string, status?: number): Promise<Task[]> {
    const params = new URLSearchParams();
    if (contextId) params.append('contextId', contextId);
    if (status !== undefined) params.append('status', status.toString());
    
    const response = await api.get<Task[]>(`/tasks?${params.toString()}`);
    return response.data;
  },

  getTask: async function(id: string): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  getPendingTasksCount: async function(): Promise<number> {
    const response = await api.get<{ count: number }>('/tasks/count');
    return response.data.count;
  },

  createTask: async function(data: CreateTaskRequest): Promise<Task> {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  updateTask: async function(id: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async function(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }
};

export const contextsApi = {
  getContexts: async function(): Promise<Context[]> {
    const response = await api.get<Context[]>('/contexts');
    return response.data;
  },
  createContext: async function(data: CreateContextRequest): Promise<Context> {
    const response = await api.post<Context>('/contexts', data);
    return response.data;
  },
  updateContext: async function(id: string, data: UpdateContextRequest): Promise<Context> {
    const response = await api.put<Context>(`/contexts/${id}`, data);
    return response.data;
  },
  deleteContext: async function(id: string): Promise<void> {
    await api.delete(`/contexts/${id}`);
  }
};

export const suggestionsApi = {
  categorizeTask: async function(data: CategorizeTaskRequest): Promise<ContextCategorizationResponse> {
    const response = await api.post<ContextCategorizationResponse>('/suggestions/categorize', data);
    return response.data;
  }
};

export const sessionPlanApi = {
  generateSessionPlan: async function(data: GenerateSessionPlanRequest): Promise<SessionPlan> {
    const response = await api.post<SessionPlan>('/sessionplan/generate', data);
    return response.data;
  },

  getSessionPlan: async function(date: string): Promise<SessionPlan> {
    const response = await api.get<SessionPlan>(`/sessionplan?date=${date}`);
    return response.data;
  },
  getSessionPlansInRange: async function(startDate: string, endDate: string): Promise<SessionPlan[]> {
    const response = await api.get<SessionPlan[]>(`/sessionplan/range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  updateSessionPlanOrder: async function(sessionPlanId: string, data: UpdateSessionPlanOrderRequest): Promise<SessionPlan> {
    const response = await api.put<SessionPlan>(`/sessionplan/${sessionPlanId}/order`, data);
    return response.data;
  }
};

export const analyticsApi = {
  getContextDistribution: async function(activeOnly: boolean = false): Promise<ContextDistribution[]> {
    const response = await api.get<ContextDistribution[]>(`/analytics/context-distribution?activeOnly=${activeOnly}`);
    return response.data;
  },

  getCompletionRate: async function(): Promise<CompletionRate[]> {
    const response = await api.get<CompletionRate[]>('/analytics/completion-rate');
    return response.data;
  }
};

export default api;

