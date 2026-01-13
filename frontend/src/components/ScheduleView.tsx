import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { sessionPlanApi } from '../services/api';
import { SessionPlan, SessionPlanItem } from '../types';
import { Calendar, Clock, Zap, GripVertical, RefreshCw } from 'lucide-react';
import '../styles/ScheduleView.css';

// Sortable task item component with drag handle
interface SortableTaskItemProps {
  item: SessionPlanItem;
  isFirstInGroup: boolean;
  contextName: string;
  contextColor: string;
}

function SortableTaskItem({ item, isFirstInGroup, contextName, contextColor }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`schedule-task-item ${isFirstInGroup ? 'first-in-group' : ''}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        <GripVertical size={20} />
      </div>
      
      <div className="task-content">
        {isFirstInGroup && (
          <div className="context-header" style={{ borderLeftColor: contextColor }}>
            <span className="context-badge" style={{ backgroundColor: contextColor }}>
              {contextName}
            </span>
          </div>
        )}
        
        <div className="task-details">
          <h4>{item.task.title}</h4>
          {item.task.description && (
            <p className="task-description">{item.task.description}</p>
          )}
          
          <div className="task-meta">
            <span className="time-estimate">
              <Clock size={14} />
              {item.task.estimatedMinutes} min
            </span>
            {item.reasoning && (
              <span className="ai-reasoning">
                <Zap size={14} />
                {item.reasoning}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main schedule view component
export default function ScheduleView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sessionPlan, setSessionPlan] = useState<SessionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [pendingTasksCount, setPendingTasksCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load pending tasks count on mount
  useEffect(() => {
    loadPendingTasksCount();
  }, []);

  // Load session plan for selected date
  useEffect(() => {
    loadSessionPlan();
  }, [selectedDate]);

  const loadPendingTasksCount = async () => {
    setLoadingCount(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/tasks/count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setPendingTasksCount(data.count || 0);
    } catch (err) {
      console.error('Failed to load pending tasks count', err);
    } finally {
      setLoadingCount(false);
    }
  };

  const loadSessionPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
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
  };

  // Generate new session plan
  const handleGeneratePlan = async () => {
    // Refresh task count before generating
    await loadPendingTasksCount();
    
    if (pendingTasksCount === 0) {
      setError('No pending tasks available to create a session plan');
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const plan = await sessionPlanApi.generateSessionPlan({ planDate: dateStr });
      setSessionPlan(plan);
      // Refresh task count after generating
      await loadPendingTasksCount();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate session plan');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Handle drag end - reorder tasks
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !sessionPlan) return;

    if (active.id !== over.id) {
      const oldIndex = sessionPlan.items.findIndex((item) => item.id === active.id);
      const newIndex = sessionPlan.items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(sessionPlan.items, oldIndex, newIndex);
      
      // Optimistically update UI
      setSessionPlan({
        ...sessionPlan,
        items: newItems.map((item, index) => ({ ...item, order: index })),
        isCustomized: true,
      });

      // Save to backend
      try {
        const taskIds = newItems.map((item) => item.task.id);
        await sessionPlanApi.updateSessionPlanOrder(sessionPlan.id, { taskIds });
      } catch (err) {
        console.error('Failed to update order:', err);
        // Revert on error
        loadSessionPlan();
      }
    }
  };

  // Navigate to previous day
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next day
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Navigate to today
  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Handle date change from input
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00');
    setSelectedDate(newDate);
  };

  // Format date for input value (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate total time
  const totalMinutes = sessionPlan?.totalEstimatedMinutes || 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="schedule-view">
      <div className="schedule-header">
        <div className="date-navigation">
          <button className="btn btn-icon" onClick={handlePreviousDay}>
            ←
          </button>
          <input
            type="date"
            className="date-picker"
            value={formatDateForInput(selectedDate)}
            onChange={handleDateChange}
          />
          <button className="btn btn-icon" onClick={handleNextDay}>
            →
          </button>
          <button className="btn btn-secondary" onClick={handleToday}>
            Today
          </button>
        </div>

        <div className="header-actions">
          <div className="task-count-badge">
            {loadingCount ? (
              <span>Loading...</span>
            ) : (
              <span>
                {pendingTasksCount} {pendingTasksCount === 1 ? 'task' : 'tasks'} available
              </span>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={handleGeneratePlan}
            disabled={generating || pendingTasksCount === 0}
          >
            <RefreshCw size={18} className={generating ? 'spinning' : ''} />
            {generating ? 'Generating...' : 'Generate Plan'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading session plan...</div>
      ) : !sessionPlan ? (
        <div className="empty-state">
          <Calendar size={48} />
          <h3>No session plan for this date</h3>
          <p>Generate an AI-powered session plan to organize your tasks</p>
        </div>
      ) : (
        <div className="session-plan-content">
          <div className="session-summary">
            <div className="summary-item">
              <span className="label">Total Tasks:</span>
              <span className="value">{sessionPlan.items.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Estimated Time:</span>
              <span className="value">
                {hours > 0 && `${hours}h `}
                {minutes}m
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Status:</span>
              <span className={`value ${sessionPlan.isCustomized ? 'customized' : 'ai-generated'}`}>
                {sessionPlan.isCustomized ? 'Customized' : 'AI Generated'}
              </span>
            </div>
          </div>

          <div className="drag-instructions">
            <GripVertical size={16} />
            Drag tasks to reorder your session
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sessionPlan.items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="schedule-tasks">
                {sessionPlan.items.map((item, index) => {
                  const isFirstInGroup =
                    index === 0 ||
                    item.groupNumber !== sessionPlan.items[index - 1].groupNumber;

                  return (
                    <SortableTaskItem
                      key={item.id}
                      item={item}
                      isFirstInGroup={isFirstInGroup}
                      contextName={item.task.contextName}
                      contextColor={item.task.contextColor}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

