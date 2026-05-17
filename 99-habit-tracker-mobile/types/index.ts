export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  items: ChecklistItem[];
  createdAt: string;
  lastUpdated: string;
  isRecurring: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
}

export interface HabitStats {
  totalHabits: number;
  totalItems: number;
  completedItems: number;
  completionRate: number;
  streak: number;
}