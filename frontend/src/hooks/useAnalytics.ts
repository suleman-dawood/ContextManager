import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import type { ContextDistribution, CompletionRate } from '../types';

export function useAnalytics() {
  const [allTasksDistribution, setAllTasksDistribution] = useState<ContextDistribution[]>([]);
  const [activeTasksDistribution, setActiveTasksDistribution] = useState<ContextDistribution[]>([]);
  const [completionRate, setCompletionRate] = useState<CompletionRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const contextDistribution = showActiveOnly ? activeTasksDistribution : allTasksDistribution;

  async function loadAnalytics() {
    try {
      setLoading(true);
      const [allTasks, activeTasks, completion] = await Promise.all([
        analyticsApi.getContextDistribution(false),
        analyticsApi.getContextDistribution(true),
        analyticsApi.getCompletionRate()
      ]);
      setAllTasksDistribution(allTasks);
      setActiveTasksDistribution(activeTasks);
      setCompletionRate(completion);
    } catch (error) {
        console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  return {
    contextDistribution,
    completionRate,
    loading,
    showActiveOnly,
    setShowActiveOnly,
    loadAnalytics
  };
}

