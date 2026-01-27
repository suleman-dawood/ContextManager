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
      const taskItem = sessionPlan.items.find(item => item.task.id === taskId);
      
      // If it's a recurring instance, convert it to a normal task first
      if (taskItem?.task.isRecurringInstance) {
        console.log('🔄 Converting recurring instance to normal task:', {
          id: taskId,
          title: taskItem.task.title,
          isRecurringInstance: taskItem.task.isRecurringInstance
        });
        const convertedTask = await tasksApi.cancelRecurringInstance(taskId);
        console.log('✅ Recurring instance converted:', {
          id: convertedTask.id,
          title: convertedTask.title,
          isRecurringInstance: convertedTask.isRecurringInstance,
          recurringTaskTemplateId: convertedTask.recurringTaskTemplateId
        });
      }
      
      const updatedItems = sessionPlan.items.filter(item => item.task.id !== taskId);
      const taskIds = updatedItems.map(item => item.task.id);
      
      console.log('📝 Updating session plan order, removing task:', taskId);
      console.log('📋 Remaining task IDs:', taskIds);
      const response = await sessionPlanApi.updateSessionPlanOrder(sessionPlan.id, { taskIds });
    
      if (response && 'message' in response) {
        console.log('🗑️ Session plan deleted - all tasks removed');
        setSessionPlan(null);
      } else {
        // Reload the session plan to get the updated state
        await loadSessionPlan();
      }
      
      await loadPendingTasksCount();
      console.log('✅ Task removed successfully, pending tasks reloaded');
    } catch (err: any) {
        console.error('❌ Error removing task:', err);
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

