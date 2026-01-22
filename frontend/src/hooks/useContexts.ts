import { useState, useEffect } from 'react';
import { contextsApi } from '../services/api';
import type { Context, CreateContextRequest, UpdateContextRequest } from '../types';

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

  async function createContext(contextData: CreateContextRequest) {
    try {
      setError(null);
      const newContext = await contextsApi.createContext(contextData);
      setContexts([...contexts, newContext]);
      return newContext;
    }
    catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create context');
      throw err;
    }
  }

  async function updateContext(id: string, updates: UpdateContextRequest) {
    try {
      setError(null);
      const updatedContext = await contextsApi.updateContext(id, updates);
      setContexts(contexts.map(c => c.id === id ? updatedContext : c));
      return updatedContext;
    }
    catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update context');
      throw err;
    }
  }
  async function deleteContext(id: string) {
    try {
      setError(null);
      await contextsApi.deleteContext(id);
      setContexts(contexts.filter(c => c.id !== id));
    }
    catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete context');
      throw err;
    }
  }

  useEffect(() => {
    loadContexts();
  }, []);

  return {
    contexts,
    loading,
    error,
    loadContexts,
    createContext,
    updateContext,
    deleteContext
  };
}

