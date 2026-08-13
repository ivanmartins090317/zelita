export const TASK_TYPES = {
  shopping: "shopping",
  call: "call",
  transport: "transport",
  other: "other",
} as const;

export type TaskType = (typeof TASK_TYPES)[keyof typeof TASK_TYPES];

export const TASK_STATUSES = {
  open: "open",
  completed: "completed",
} as const;

export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];

export interface TaskTypeVisual {
  icon: string;
  bgClass: string;
}

export const TASK_TYPE_VISUALS: Record<TaskType, TaskTypeVisual> = {
  shopping: { icon: "🛒", bgClass: "bg-orange-100" },
  call: { icon: "📞", bgClass: "bg-pink-100" },
  transport: { icon: "🚗", bgClass: "bg-teal-100" },
  other: { icon: "✓", bgClass: "bg-gray-100" },
};

export function isTaskType(value: string): value is TaskType {
  return Object.values(TASK_TYPES).includes(value as TaskType);
}
