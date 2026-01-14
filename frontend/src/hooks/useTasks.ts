import { useState, useEffect } from 'react';
import { tasksApi } from '../services/api';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksApi.getTasks();
      setTasks(data);
    } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load tasks');
        if (err.response?.status === 401) {
          throw err;
        }
    } finally {
      setLoading(false);
    }
  }

  async function createTask(taskData: CreateTaskRequest) {
    try {
      setError(null);
      const newTask = await tasksApi.createTask(taskData);
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to create task';
        setError(errorMessage);
        throw err;
    }
  }

  async function updateTask(taskId: string, updates: UpdateTaskRequest) {
    try {
      setError(null);
      const updatedTask = await tasksApi.updateTask(taskId, updates);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      return updatedTask;
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to update task';
        setError(errorMessage);
        throw err;
    }
  }

  async function deleteTask(taskId: string) {
    try {
      setError(null);
      await tasksApi.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to delete task';
        setError(errorMessage);
        throw err;
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask
  };
}

