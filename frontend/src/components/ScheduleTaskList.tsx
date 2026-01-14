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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SessionPlanItem } from '../types';
import { SortableTaskItem } from './SortableTaskItem';
import { sortScheduleItems, isFirstInGroup } from '../utils/scheduleUtils';
import '../styles/ScheduleView.css';

interface ScheduleTaskListProps {
  items: SessionPlanItem[];
  onDragEnd: (event: DragEndEvent) => void;
  onRemove: (taskId: string) => void;
}

export function ScheduleTaskList({ items, onDragEnd, onRemove }: ScheduleTaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedItems = sortScheduleItems(items);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={sortedItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="schedule-tasks">
          {sortedItems.map((item, index) => (
            <SortableTaskItem
              key={item.id}
              item={item}
              isFirstInGroup={isFirstInGroup(item, index, sortedItems)}
              contextName={item.task.contextName}
              contextColor={item.task.contextColor}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
