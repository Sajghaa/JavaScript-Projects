import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types';

const STORAGE_KEY = '@habits';

// Check if AsyncStorage is available
const isAsyncStorageAvailable = () => {
  try {
    return AsyncStorage && typeof AsyncStorage.getItem === 'function';
  } catch {
    return false;
  }
};

// In-memory fallback storage (for when AsyncStorage fails)
let memoryStorage: Habit[] = [];

export const saveHabits = async (habits: Habit[]): Promise<boolean> => {
  try {
    if (isAsyncStorageAvailable()) {
      const jsonValue = JSON.stringify(habits);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      return true;
    } else {
      // Fallback to memory storage
      memoryStorage = habits;
      return true;
    }
  } catch (e) {
    console.error('Failed to save habits:', e);
    // Fallback to memory storage
    memoryStorage = habits;
    return false;
  }
};

export const loadHabits = async (): Promise<Habit[]> => {
  try {
    if (isAsyncStorageAvailable()) {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const habits = JSON.parse(jsonValue);
        // Ensure each habit has all required fields
        return habits.map((habit: any) => ({
          ...habit,
          items: habit.items || [],
          createdAt: habit.createdAt || new Date().toISOString(),
          lastUpdated: habit.lastUpdated || new Date().toISOString(),
          isRecurring: habit.isRecurring || false,
          frequency: habit.frequency || 'daily',
          streak: habit.streak || 0,
        }));
      }
    }
    // Return from memory storage if available
    if (memoryStorage.length > 0) {
      return memoryStorage;
    }
    return getSampleHabits();
  } catch (e) {
    console.error('Failed to load habits:', e);
    return memoryStorage.length > 0 ? memoryStorage : getSampleHabits();
  }
};

// Generate sample habits for demo
const getSampleHabits = (): Habit[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'sample1',
      name: 'Morning Routine',
      description: 'Start your day right with these healthy habits',
      icon: 'sunny',
      color: '#f59e0b',
      items: [
        { id: 's1', text: 'Wake up at 6 AM', completed: false },
        { id: 's2', text: 'Drink a glass of water', completed: false },
        { id: 's3', text: '15 min meditation', completed: false },
        { id: 's4', text: 'Morning exercise', completed: false },
      ],
      createdAt: now,
      lastUpdated: now,
      isRecurring: true,
      frequency: 'daily',
      streak: 0,
    },
    {
      id: 'sample2',
      name: 'Daily Learning',
      description: 'Improve your skills every day',
      icon: 'book',
      color: '#10b981',
      items: [
        { id: 'l1', text: 'Read for 30 minutes', completed: false },
        { id: 'l2', text: 'Complete a coding challenge', completed: false },
        { id: 'l3', text: 'Watch a tutorial', completed: false },
      ],
      createdAt: now,
      lastUpdated: now,
      isRecurring: true,
      frequency: 'daily',
      streak: 0,
    },
  ];
};

export const addHabit = async (habit: Habit): Promise<Habit[]> => {
  const habits = await loadHabits();
  const updated = [habit, ...habits];
  await saveHabits(updated);
  return updated;
};

export const updateHabit = async (id: string, updates: Partial<Habit>): Promise<Habit[]> => {
  const habits = await loadHabits();
  const index = habits.findIndex(h => h.id === id);
  if (index !== -1) {
    habits[index] = { ...habits[index], ...updates };
    await saveHabits(habits);
  }
  return habits;
};

export const deleteHabit = async (id: string): Promise<Habit[]> => {
  const habits = await loadHabits();
  const updated = habits.filter(h => h.id !== id);
  await saveHabits(updated);
  return updated;
};

export const clearHabits = async (): Promise<boolean> => {
  try {
    if (isAsyncStorageAvailable()) {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
    memoryStorage = [];
    return true;
  } catch (e) {
    console.error('Failed to clear habits:', e);
    memoryStorage = [];
    return false;
  }
};