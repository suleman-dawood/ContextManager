import type { SessionPlanItem } from '../types';
import { TaskStatus } from '../types';

export function sortScheduleItems(items: SessionPlanItem[]): SessionPlanItem[] {
  const activeItems: SessionPlanItem[] = [];
  const completedItems: SessionPlanItem[] = [];

  for (const item of items) {
    if (item.task.status === TaskStatus.Completed) {
      completedItems.push(item);
    } else {
      activeItems.push(item);
    }
  }

  activeItems.sort((a, b) => a.order - b.order);
  completedItems.sort((a, b) => a.order - b.order);

  return [...activeItems, ...completedItems];
}

export function isFirstInGroup(
  item: SessionPlanItem,
  index: number,
  sortedItems: SessionPlanItem[]
): boolean {
  if (index === 0) {
    return true;
  }

  const previousItem = sortedItems[index - 1];
  const isCompleted = item.task.status === TaskStatus.Completed;
  const previousIsCompleted = previousItem.task.status === TaskStatus.Completed;

  if (isCompleted && !previousIsCompleted) {
    return true;
  }

  if (!isCompleted && previousIsCompleted) {
    return true;
  }

  if (!isCompleted && item.groupNumber !== previousItem.groupNumber) {
    return true;
  }

  return false;
}

