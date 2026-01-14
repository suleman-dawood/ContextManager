import { useState, useEffect } from 'react';
import { contextsApi } from '../services/api';
import type { Context } from '../types';

export function useContexts() {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadContexts() {
    try {
      setLoading(true);
      setError(null);
      const data = await contextsApi.getContexts();
      setContexts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load contexts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContexts();
  }, []);

  return {
    contexts,
    loading,
    error,
    loadContexts
  };
}

