import { useState, useEffect } from 'react';
import { recurringTasksApi, tasksApi } from '../services/api';
import type { CreateRecurringTaskRequest, UpdateRecurringTaskRequest, RecurringTask } from '../types';

export function useRecurringTasks() {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRecurringTasks() {
    try {
      setLoading(true);
      setError(null);
      const data = await recurringTasksApi.getRecurringTasks();
      setRecurringTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load recurring tasks');
      if (err.response?.status === 401) {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }

  async function createRecurringTask(recurringTaskData: CreateRecurringTaskRequest) {
    try {
      setError(null);
      const newRecurringTask = await recurringTasksApi.createRecurringTask(recurringTaskData);
      setRecurringTasks([...recurringTasks, newRecurringTask]);
      return newRecurringTask;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create recurring task');
      throw err;
    }
  }

  async function updateRecurringTask(id: string, updates: UpdateRecurringTaskRequest) {
    try {
      setError(null);
      const updatedRecurringTask = await recurringTasksApi.updateRecurringTask(id, updates);
      setRecurringTasks(recurringTasks.map(t => t.id === id ? updatedRecurringTask : t));
      return updatedRecurringTask;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update recurring task');
      throw err;
    }
  }

  async function deleteRecurringTask(id: string) {
    try {
      setError(null);
      await recurringTasksApi.deleteRecurringTask(id);
      setRecurringTasks(recurringTasks.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete recurring task');
      throw err;
    }
  }
  
  async function deleteTaskInstance(id: string) {
    try {
      setError(null);
      await tasksApi.deleteTaskInstance(id);
      setRecurringTasks(recurringTasks.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task instance');
      throw err;
    }
  }
  async function deleteTaskAndAllInstances(id: string) {
    try {
      setError(null);
      await tasksApi.deleteTaskAndAllInstances(id);
      setRecurringTasks(recurringTasks.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task and all instances');
      throw err;
    }
  }

  useEffect(() => {
    loadRecurringTasks();
  }, []);

  return {
    recurringTasks,
    loading,
    error,
    loadRecurringTasks,
    createRecurringTask,
    updateRecurringTask,
    deleteRecurringTask,
    deleteTaskInstance,
    deleteTaskAndAllInstances
  };
}