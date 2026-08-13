import { TASK_TYPES, type TaskType } from "./task-types";
import { isDateOnOrBefore } from "./agenda-labels";

export type NeedsPriorityKind =
  | "refill"
  | "task_overdue"
  | "task_today"
  | "task_assigned";

export interface NeedsPriorityItem {
  id: string;
  kind: NeedsPriorityKind;
  sortKey: number;
  title: string;
  subtitle: string;
  icon: string;
  href?: string;
}

export interface TaskNeedsInput {
  id: string;
  title: string;
  taskType: TaskType;
  dueDate: string | null;
  assigneeProfileId: string | null;
  assigneeName: string | null;
}

export interface BuildNeedsInput {
  todayDateKey: string;
  currentUserId: string;
  refillItems: NeedsPriorityItem[];
  tasks: TaskNeedsInput[];
  copy: {
    assignedToYou: string;
    assignedToTemplate: string;
    untilTemplate: string;
    separator: string;
    consultasHref: string;
  };
  maxItems?: number;
}

const TASK_ICONS: Record<TaskType, string> = {
  [TASK_TYPES.shopping]: "🛒",
  [TASK_TYPES.call]: "📞",
  [TASK_TYPES.transport]: "🚗",
  [TASK_TYPES.other]: "✓",
};

function buildTaskSubtitle(
  task: TaskNeedsInput,
  input: BuildNeedsInput,
): string {
  const parts: string[] = [];
  if (task.dueDate) {
    parts.push(
      input.copy.untilTemplate.replace(
        "{data}",
        task.dueDate.split("-").reverse().join("/"),
      ),
    );
  }
  if (task.assigneeProfileId === input.currentUserId) {
    parts.push(input.copy.assignedToYou);
  } else if (task.assigneeName) {
    parts.push(
      input.copy.assignedToTemplate.replace("{nome}", task.assigneeName),
    );
  }
  return parts.join(input.copy.separator);
}

function taskPriorityKind(
  task: TaskNeedsInput,
  todayDateKey: string,
): NeedsPriorityKind | null {
  if (task.dueDate) {
    if (isDateOnOrBefore(task.dueDate, todayDateKey)) {
      const isOverdue = task.dueDate < todayDateKey;
      return isOverdue ? "task_overdue" : "task_today";
    }
    return null;
  }
  return "task_assigned";
}

const KIND_ORDER: Record<NeedsPriorityKind, number> = {
  refill: 0,
  task_overdue: 1,
  task_today: 2,
  task_assigned: 3,
};

export function buildNeedsAttentionItems(
  input: BuildNeedsInput,
): NeedsPriorityItem[] {
  const maxItems = input.maxItems ?? 3;
  const taskItems: NeedsPriorityItem[] = [];

  for (const task of input.tasks) {
    const kind = taskPriorityKind(task, input.todayDateKey);
    if (!kind) continue;
    if (kind === "task_assigned" && task.assigneeProfileId !== input.currentUserId) {
      continue;
    }

    taskItems.push({
      id: `task-${task.id}`,
      kind,
      sortKey: KIND_ORDER[kind],
      title: task.title,
      subtitle: buildTaskSubtitle(task, input),
      icon: TASK_ICONS[task.taskType],
      href: input.copy.consultasHref,
    });
  }

  taskItems.sort((a, b) => a.sortKey - b.sortKey);

  const combined = [...input.refillItems, ...taskItems].sort(
    (a, b) => a.sortKey - b.sortKey,
  );

  return combined.slice(0, maxItems);
}
