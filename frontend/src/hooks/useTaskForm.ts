import { useState } from 'react';
import type { CreateTaskRequest, UpdateTaskRequest, Task } from '../types';
import { Priority } from '../types';

export function useTaskForm(task?: Task) {
  const [formData, setFormData] = useState<Omit<CreateTaskRequest, 'contextId'> | UpdateTaskRequest>(() => {
    if (task) {
      return {
        contextId: task.contextId,
        title: task.title,
        description: task.description,
        estimatedMinutes: task.estimatedMinutes,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : undefined
      };
    }
    return {
      title: '',
      description: '',
      estimatedMinutes: 30,
      priority: Priority.Medium,
      dueDate: undefined
    };
  });

  function updateField<K extends keyof (Omit<CreateTaskRequest, 'contextId'> 
    | UpdateTaskRequest)> (field: K, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function updateTitle(value: string) {
    updateField('title', value);
  }
  function updateDescription(value: string) {
    updateField('description', value);
  }
  function updateEstimatedMinutes(value: number) {
    updateField('estimatedMinutes', value);
  }
  function updatePriority(value: Priority) {
    updateField('priority', value);
  }
  function updateDueDate(value: string | undefined) {
    updateField('dueDate', value);
  }
  function updateContextId(value: string) {
    if ('contextId' in formData) {
      setFormData(prev => ({ ...prev, contextId: value }));
    }
  }
  function updateStatus(value: number) {
    if ('status' in formData) {
      setFormData(prev => ({ ...prev, status: value }));
    }
  }

  return {
    formData,
    updateTitle,
    updateDescription,
    updateEstimatedMinutes,
    updatePriority,
    updateDueDate,
    updateContextId,
    updateStatus,
    setFormData
  };
}

