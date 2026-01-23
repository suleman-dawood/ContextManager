import { useState } from 'react';
import { suggestionsApi } from '../services/api';
import type { TaskFromNaturalLanguageResponse, TaskFromNaturalLanguageRequest } from '../types';

export function useSuggestions() {
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<TaskFromNaturalLanguageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function getTaskFromNaturalLanguage(TaskFromNaturalLanguageRequest: TaskFromNaturalLanguageRequest): Promise<TaskFromNaturalLanguageResponse | null> {
    setSuggesting(true);
    setError(null);

    try {
      const result = await suggestionsApi.getTaskFromNaturalLanguage(TaskFromNaturalLanguageRequest);
      setSuggestion(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to get task from natural language';
      setError(errorMessage);
      return null;
    } finally {
      setSuggesting(false);
    }
  }

  function reset() {
    setSuggestion(null);
    setError(null);
    setSuggesting(false);
  }

  return {
    suggesting,
    suggestion,
    error,
    getTaskFromNaturalLanguage,
    reset
  }
}