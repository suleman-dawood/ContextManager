import { useState, useEffect } from 'react';
import { sessionPlanApi, tasksApi } from '../services/api';
import type { SessionPlan, GenerateSessionPlanRequest } from '../types';
import { formatLocalDate } from '../utils/dateUtils';

export function useSessionPlan(date: Date) {
  const [sessionPlan, setSessionPlan] = useState<SessionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [pendingTasksCount, setPendingTasksCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);

  async function loadPendingTasksCount() {
    setLoadingCount(true);
    try {
      const count = await tasksApi.getPendingTasksCount();
      setPendingTasksCount(count);
      return count;
    } catch (err: any) {
      console.error('Failed to load pending tasks count', err);
      return 0;
    } finally {
      setLoadingCount(false);
    }
  };

  async function loadSessionPlan() {
    setLoading(true);
    setError(null);
    try {
      const dateStr = formatLocalDate(date);
      const plan = await sessionPlanApi.getSessionPlan(dateStr);
      setSessionPlan(plan);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setSessionPlan(null);
      } else {
        setError('Failed to load session plan');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function generatePlan() {
    const count = await loadPendingTasksCount();
    
    if (count === 0) {
      setError('No available tasks to create a session plan');
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const dateStr = formatLocalDate(date);
      const request: GenerateSessionPlanRequest = { planDate: dateStr };
      const plan = await sessionPlanApi.generateSessionPlan(request);
      setSessionPlan(plan);
      await loadPendingTasksCount();
    } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to generate session plan');
        console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  async function removeTask(taskId: string) {
    if (!sessionPlan) return;
    
    try {
      const updatedItems = sessionPlan.items.filter(item => item.task.id !== taskId);
      
      if (updatedItems.length === 0) {
        setSessionPlan(null);
        await loadPendingTasksCount();
        return;
      }
      
      const taskIds = updatedItems.map(item => item.task.id);
      await sessionPlanApi.updateSessionPlanOrder(sessionPlan.id, { taskIds });
      await loadSessionPlan();
      await loadPendingTasksCount();
    } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to remove task from plan');
    }
  }

  async function updateOrder(taskIds: string[]) {
    if (!sessionPlan) return;
    
    try {
      await sessionPlanApi.updateSessionPlanOrder(sessionPlan.id, { taskIds });
      await loadSessionPlan();
    } catch (err) {
        await loadSessionPlan();
        throw err;
    }
  }

  useEffect(() => {
    loadPendingTasksCount();
  }, []);

  useEffect(() => {
    loadSessionPlan();
  }, [date]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionPlan) {
        loadSessionPlan();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionPlan, date]);

  return {
    sessionPlan,
    loading,
    error,
    generating,
    pendingTasksCount,
    loadingCount,
    loadSessionPlan,
    generatePlan,
    removeTask,
    updateOrder,
    loadPendingTasksCount
  };
}

