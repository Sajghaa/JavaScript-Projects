import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { loadHabits, updateHabit, deleteHabit } from '../../utils/storage';
import { Habit, ChecklistItem } from '../../types';
import ChecklistItemComponent from '../../components/ChecklistItem';
import { Colors } from '../../constants/Colors';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [habit, setHabit] = useState<Habit | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadHabit();
    }, [id])
  );

  const loadHabit = async () => {
    const habits = await loadHabits();
    const found = habits.find(h => h.id === id);
    setHabit(found || null);
  };

  const updateHabitData = async (updates: Partial<Habit>) => {
    if (habit) {
      await updateHabit(habit.id, updates);
      await loadHabit();
    }
  };

  const toggleItem = async (itemId: string) => {
    if (habit) {
      const updatedItems = habit.items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      await updateHabitData({ items: updatedItems, lastUpdated: new Date().toISOString() });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const deleteItem = (itemId: string) => {
    Alert.alert('Delete Item', 'Remove this item from your habit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (habit) {
            const updatedItems = habit.items.filter(item => item.id !== itemId);
            await updateHabitData({ items: updatedItems });
          }
        },
      },
    ]);
  };

  const addNewItem = () => {
    Alert.prompt(
      'Add Item',
      'Enter a new task for this habit',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (text) => {
            if (text && text.trim() && habit) {
              const newItem: ChecklistItem = {
                id: Date.now().toString(),
                text: text.trim(),
                completed: false,
              };
              const updatedItems = [...habit.items, newItem];
              await updateHabitData({ items: updatedItems });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const deleteHabitHandler = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? All progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(id);
            router.back();
          },
        },
      ]
    );
  };

  if (!habit) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const completedCount = habit.items.filter(i => i.completed).length;
  const totalCount = habit.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${habit.color}20` }]}>
            <Ionicons name={habit.icon as any} size={32} color={habit.color} />
          </View>
          <View>
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.habitDate}>
              Created: {new Date(habit.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={deleteHabitHandler} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      {habit.description ? (
        <Text style={styles.description}>{habit.description}</Text>
      ) : null}

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Progress</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: habit.color }]} />
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>✅ {completedCount} completed</Text>
          <Text style={styles.statsText}>📋 {totalCount} total</Text>
          <Text style={styles.statsText}>⏳ {totalCount - completedCount} remaining</Text>
        </View>
      </View>

      <View style={styles.itemsSection}>
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsTitle}>Tasks</Text>
          <TouchableOpacity onPress={addNewItem} style={styles.addItemButton}>
            <Ionicons name="add-circle" size={24} color={Colors.primary} />
            <Text style={styles.addItemText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {habit.items.map(item => (
          <ChecklistItemComponent
            key={item.id}
            item={item}
            onToggle={toggleItem}
            onDelete={deleteItem}
          />
        ))}

        {habit.items.length === 0 && (
          <Text style={styles.emptyItems}>No tasks yet. Add your first task!</Text>
        )}
      </View>

      {habit.isRecurring && (
        <View style={styles.recurringInfo}>
          <Ionicons name="repeat" size={20} color={Colors.gray} />
          <Text style={styles.recurringText}>
            Repeats {habit.frequency}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  habitName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  habitDate: {
    fontSize: 12,
    color: Colors.gray,
  },
  deleteButton: {
    padding: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 20,
    lineHeight: 20,
  },
  progressSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.lighterGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsText: {
    fontSize: 12,
    color: Colors.gray,
  },
  itemsSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addItemText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyItems: {
    textAlign: 'center',
    color: Colors.gray,
    paddingVertical: 20,
  },
  recurringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  recurringText: {
    fontSize: 12,
    color: Colors.gray,
  },
});