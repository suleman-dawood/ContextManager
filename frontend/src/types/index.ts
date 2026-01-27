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
  recurringTaskTemplateId?: string;
  isRecurringInstance?: boolean;
}

export interface RecurringTask {
  id: string;
  userId: string;
  contextId: string;
  contextName: string;
  contextColor: string;
  title: string;
  description: string | null;
  estimatedMinutes: number;
  priority: Priority;
  recurrenceType: RecurrenceType;
  recurrenceDays: string[] | null;
  recurrenceStartDate: string;
  recurrenceEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  instanceCount: number;
  recurrencePattern: string;
}

export enum RecurrenceType {
  Daily = 0,
  Weekly = 1,
  Biweekly = 2,
  Monthly = 3,
  Custom = 4
}

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
  recurringTaskTemplateId?: string;
}

export interface UpdateTaskRequest {
  contextId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  recurringTaskTemplateId?: string;
}

export interface ContextCategorizationResponse {
  contextId: string;
  contextName: string;
  confidence: number;
  reasoning: string;
}

export interface CategorizeTaskRequest {
  title: string;
  description: string;
}

export interface TaskFromNaturalLanguageRequest {
  naturalLanguage: string;
}

export interface TaskFromNaturalLanguageResponse {
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: Priority;
  dueDate: string | null;
  contextId: string;
}

export interface SessionPlanItem {
  id: string;
  task: Task;
  order: number;
  groupNumber: number;
  reasoning: string;
  startTime?: string;
  endTime?: string;
}

export interface SessionPlan {
  id: string;
  planDate: string;
  createdAt: string;
  lastModifiedAt?: string;
  isCustomized: boolean;
  items: SessionPlanItem[];
  totalEstimatedMinutes?: number;
}

export interface GenerateSessionPlanRequest {
  planDate: string;
}

export interface UpdateSessionPlanOrderRequest {
  taskIds: string[];
}

export interface CreateContextRequest {
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface UpdateContextRequest {
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface ContextResponse {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface CreateRecurringTaskRequest {
  contextId: string;
  title: string;
  description?: string | null;
  estimatedMinutes: number;
  priority: Priority;
  recurrenceType: RecurrenceType;
  recurrenceDays?: string[] | null;
  recurrenceStartDate: string;
  recurrenceEndDate?: string | null;
}

export interface UpdateRecurringTaskRequest {
  contextId: string;
  title: string;
  description?: string | null;
  estimatedMinutes: number;
  priority: Priority;
  recurrenceType: RecurrenceType;
  recurrenceDays?: string[] | null;
  recurrenceStartDate: string;
  recurrenceEndDate?: string | null;
}

export interface RecurringTaskResponse {
  id: string;
  userId: string;
  contextId: string;
  contextName: string;
  contextColor: string;
  title: string;
  description: string | null;
  estimatedMinutes: number;
  priority: Priority;
  recurrenceType: RecurrenceType;
  recurrenceDays: string[] | null;
  recurrenceStartDate: string;
  recurrenceEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  instanceCount: number;
  recurrencePattern: string;
}

export type DeleteTaskResult =
  | { deleted: true }
  | { isRecurring: true; templateId: string; message: string };
