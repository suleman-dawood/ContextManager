import { useState } from 'react';
import { Calendar, GripVertical } from 'lucide-react';
import { useSessionPlan } from '../hooks/useSessionPlan';
import { useTasks } from '../hooks/useTasks';
import { ScheduleHeader } from './ScheduleHeader';
import { ScheduleTaskList } from './ScheduleTaskList';
import { Loading } from './Loading';
import { Error } from './Error';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { TaskStatus } from '../types';
import type { UpdateTaskRequest } from '../types';
import '../styles/ScheduleView.css';

export default function ScheduleView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const {
    sessionPlan,
    loading,
    error,
    generating,
    pendingTasksCount,
    loadingCount,
    generatePlan,
    removeTask,
    updateOrder,
    loadSessionPlan
  } = useSessionPlan(selectedDate);

  const { updateTask } = useTasks();

  function handlePreviousDay() {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  }

  function handleNextDay() {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  }

  function handleToday() {
    setSelectedDate(new Date());
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || !sessionPlan) return;

    if (active.id !== over.id) {
      const oldIndex = sessionPlan.items.findIndex((item) => item.id === active.id);
      const newIndex = sessionPlan.items.findIndex((item) => item.id === over.id);
      if (oldIndex < 0 || newIndex < 0) {
        return;
      }
      const newItems = arrayMove(sessionPlan.items, oldIndex, newIndex);
        const taskIds = newItems.map((item) => item.task.id);
      
      try {
        await updateOrder(taskIds);
      } catch (err) {
        console.error('Failed to update order:', err);
      }
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    if (!sessionPlan) return;
    
    const task = sessionPlan.items.find(item => item.task.id === taskId)?.task;
    if (!task) return;

    const updates: UpdateTaskRequest = {
      contextId: task.contextId,
      title: task.title,
      description: task.description,
      estimatedMinutes: task.estimatedMinutes,
      priority: task.priority,
      status,
      dueDate: task.dueDate
    };

    try {
      await updateTask(taskId, updates);
      await loadSessionPlan();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  }

  const totalMinutes = sessionPlan?.totalEstimatedMinutes || 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="schedule-view">
      <ScheduleHeader
        selectedDate={selectedDate}
        pendingTasksCount={pendingTasksCount}
        loadingCount={loadingCount}
        generating={generating}
        onDateChange={setSelectedDate}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onToday={handleToday}
        onGeneratePlan={generatePlan}
      />

      {error && <Error message={error} />}

      {loading ? (
        <Loading message="Loading session plan..." />
      ) : !sessionPlan ? (
        <div className="empty-state">
          <Calendar size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No session plan for this date</h3>
          <p className="empty-state-text">Generate an AI-powered session plan to organize your tasks</p>
        </div>
      ) : (
        <div className="session-plan-content">
          <div className="session-summary">
            <div className="summary-item">
              <span className="label summary-label">Total Tasks:</span>
              <span className="value summary-value">{sessionPlan.items.length}</span>
            </div>
            <div className="summary-item">
              <span className="label summary-label">Estimated Time:</span>
              <span className="value summary-value">
                {hours > 0 && `${hours}h `}
                {minutes}m
              </span>
            </div>
            <div className="summary-item">
              <span className="label summary-label">Status:</span>
              <span className={`value summary-value ${sessionPlan.isCustomized ? 'customized' : 'ai-generated'}`}>
                {sessionPlan.isCustomized ? 'Customized' : 'AI Generated'}
              </span>
            </div>
          </div>

          <div className="drag-instructions">
            <GripVertical size={12} className="drag-instructions-icon" />
            <span className="drag-instructions-text">Drag tasks to reorder your session</span>
          </div>

          <ScheduleTaskList
            items={sessionPlan.items}
            onDragEnd={handleDragEnd}
            onRemove={removeTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      )}
    </div>
  );
}
