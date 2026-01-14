import { useState } from 'react';
import { suggestionsApi } from '../services/api';
import type { ContextCategorizationResponse, CategorizeTaskRequest } from '../types';

export function useTaskCategorization() {
  const [categorizing, setCategorizing] = useState(false);
  const [categorization, setCategorization] = useState<ContextCategorizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categorizeTask = async (data: CategorizeTaskRequest): Promise<ContextCategorizationResponse | null> => {
    setCategorizing(true);
    setError(null);
    
    try {
      const result = await suggestionsApi.categorizeTask(data);
      setCategorization(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to categorize task';
      setError(errorMessage);
      return null;
    } finally {
      setCategorizing(false);
    }
  };

  const reset = () => {
    setCategorization(null);
    setError(null);
    setCategorizing(false);
  };

  return {
    categorizing,
    categorization,
    error,
    categorizeTask,
    reset
  };
}

