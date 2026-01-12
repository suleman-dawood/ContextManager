// Enums matching backend
export enum Priority {
  Low = 0,
  Medium = 1,
  High = 2
}

export enum TaskStatus {
  Todo = 0,
  InProgress = 1,
  Completed = 2
}

// Core entities
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Context {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface Task {
  id: string;
  userId: string;
  contextId: string;
  contextName: string;
  contextColor: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TaskSuggestion {
  id: string;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  estimatedMinutes: number;
  confidence: number;
  reasoning: string;
  createdAt: string;
}

// Analytics
export interface ContextDistribution {
  context: string;
  color: string;
  count: number;
}

export interface CompletionRate {
  date: string;
  rate: number;
  completed: number;
  total: number;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
}

export interface CreateTaskRequest {
  contextId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: Priority;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
}

